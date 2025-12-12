import os
import time
import threading
from contextlib import contextmanager
from pathlib import Path
try:
    from apps.utils.utils import system_
except:
    from .utils import system_
if system_() == 'Windows':
    import msvcrt
elif system_() in ('Linux', 'Darwin'):
    import fcntl


class FileLock:
    """
    跨线程和跨进程的文件锁实现
    
    支持 Windows (msvcrt) 和 POSIX (fcntl) 平台。
    在不支持平台锁的环境中，使用基于文件存在的简单锁机制。
    """
    
    def __init__(self, lockfile_path: str, timeout: float = 5.0):
        """
        初始化文件锁
        
        Args:
            lockfile_path: 锁文件的路径
            timeout: 获取锁的超时时间（秒）
        """
        self.lockfile_path = lockfile_path
        self.timeout = timeout
        self._thread_lock = threading.Lock()
        self._file_handle = None
    
    @contextmanager
    def acquire(self):
        """
        获取文件锁的上下文管理器
        
        Yields:
            None
            
        Raises:
            TimeoutError: 如果在超时时间内无法获取锁
        """
        # 先获取线程锁（进程内互斥）
        acquired_thread_lock = self._thread_lock.acquire(timeout=self.timeout)
        if not acquired_thread_lock:
            raise TimeoutError(f'Timeout acquiring thread lock for {self.lockfile_path}')
        
        try:
            # 再获取文件锁（跨进程互斥）
            self._acquire_file_lock()
            yield
        finally:
            # 释放文件锁
            self._release_file_lock()
            # 释放线程锁
            self._thread_lock.release()
    
    def _acquire_file_lock(self):
        """获取文件级别的锁"""
        start_time = time.time()
        
        while True:
            try:
                # 打开或创建锁文件
                self._file_handle = open(self.lockfile_path, 'w+')
                
                # 尝试根据平台获取文件锁
                if msvcrt and os.name == 'nt':
                    # Windows 平台使用 msvcrt
                    try:
                        msvcrt.locking(self._file_handle.fileno(), msvcrt.LK_NBLCK, 1)
                        return  # 成功获取锁
                    except OSError:
                        # 锁被占用，继续重试
                        pass
                        
                elif fcntl:
                    # POSIX 平台使用 fcntl
                    try:
                        fcntl.flock(self._file_handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                        return  # 成功获取锁
                    except (OSError, IOError):
                        # 锁被占用，继续重试
                        pass
                        
                else:
                    # 不支持平台锁，使用文件存在作为原始锁机制
                    try:
                        # 尝试独占方式创建锁文件
                        fd = os.open(self.lockfile_path, os.O_CREAT | os.O_EXCL | os.O_RDWR)
                        os.close(fd)
                        self._file_handle = open(self.lockfile_path, 'w+')
                        return  # 成功获取锁
                    except FileExistsError:
                        # 锁被占用，继续重试
                        pass
                
                # 关闭文件句柄准备重试
                if self._file_handle:
                    self._file_handle.close()
                    self._file_handle = None
                
                # 检查是否超时
                if (time.time() - start_time) > self.timeout:
                    raise TimeoutError(f'Timeout acquiring file lock for {self.lockfile_path}')
                
                # 短暂休眠后重试
                time.sleep(0.05)
                
            except Exception as e:
                # 发生异常时清理文件句柄
                if self._file_handle:
                    try:
                        self._file_handle.close()
                    except Exception:
                        pass
                    self._file_handle = None
                
                # 如果不是预期的锁竞争异常，则向上抛出
                if not isinstance(e, TimeoutError):
                    raise TimeoutError(f'Error acquiring file lock: {e}')
                raise
    
    def _release_file_lock(self):
        """释放文件级别的锁"""
        if not self._file_handle:
            return
        
        try:
            # 根据平台释放文件锁
            if msvcrt and os.name == 'nt':
                try:
                    self._file_handle.seek(0)
                    msvcrt.locking(self._file_handle.fileno(), msvcrt.LK_UNLCK, 1)
                except Exception:
                    pass
                    
            elif fcntl:
                try:
                    fcntl.flock(self._file_handle.fileno(), fcntl.LOCK_UN)
                except Exception:
                    pass
            
            # 关闭文件句柄
            self._file_handle.close()
            
        finally:
            self._file_handle = None
            
            # 尝试删除锁文件
            try:
                if os.path.exists(self.lockfile_path):
                    os.remove(self.lockfile_path)
            except Exception:
                # 删除失败不影响功能，忽略错误
                pass
