from flask import Flask, jsonify, request
from flask_cors import CORS
from apps.account.storage import Storage
from apps.utils.data import dataItem, dataBudget, dataTodo
from apps.account.budget import Budget
from apps.Todo.storage import Storage as TodoStorage
from apps.utils.utils import current_month
app = Flask(__name__)
CORS(app)


storage = Storage("data.csv")
budget = Budget("budget.json")
todo_storage = TodoStorage("todo_data.csv")
mode = "run"
def switch_mode(mode = "run"):
    if mode == "test":
        app.config["PROPAGATE_EXCEPTIONS"] = True
        app.config["DEBUG"] = True
        return 0
    elif mode == "run":
        return 1
    else:
        return -1

@app.route("/api/receive", methods=["POST"])
def receive():
    try:
        data = request.get_json()
        item = dataItem(**data)
        storage.append_row([
            int(storage.fetch_id() + 1),
            item.date,
            item.event,
            item.amount,
            item.type,
            item.remark,
            item.category,
        ])

        return jsonify({"status": "ok", "data": item.model_dump()})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/receive:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/data", methods=["GET"])
def get_data():
    try:
        rows = storage.read_all()
        header, data_rows = rows[0], rows[1:]

        result = [
            {
                **dict(zip(header, row)),
                "id": int(row[0]),
                "amount": float(row[3]) if row[3] else 0.0,
            }
            for row in data_rows
        ]

        return jsonify({"status": "ok", "data": result})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/data:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/data", methods=["DELETE"])
def delete_data():
    try:
        id_value = request.args.get("id")
        if not id_value:
            return jsonify({"status": "error", "message": "missing id"}), 400

        storage.delete_by_id(id_value)

        return jsonify({"status": "ok", "deleted": id_value})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/data DELETE:", e)
            raise
        return jsonify({"status": "error", "message": str(e)}), 400
@app.route("/api/budget", methods=["PUT"])
def set_budget():
    try:
        data = request.get_json()
        budget_item = dataBudget(**data)
        budget.write_budget(budget_item.year, budget_item.month, budget_item.monthlyLimit)
        return jsonify({"status": "ok", "data": budget_item.model_dump()})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/budget PUT:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400
@app.route("/api/budget", methods=["GET"])
def read_budget():
    try:
        year, month = current_month()
        monthly_limit = budget.read_budget(year, month)
        result = {
            "year": year,
            "month": month,
            "monthlyLimit": monthly_limit if monthly_limit is not None else 0,
            "enabled": True
        }
        return jsonify({"status": "ok", "data": result})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/budget GET:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400
        

@app.route("/api/todo", methods=["GET"])
def get_todo():
    """获取所有 TODO 项"""
    try:
        rows = todo_storage.read_all()
        header, data_rows = rows[0], rows[1:]

        result = [
            {
                "id": row[1],  # uuid 作为前端 id
                "title": row[2],
                "description": row[3] if row[3] else "",
                "completed": row[4].lower() == "true",
                "priority": row[5],
                "dueDate": row[6] if row[6] else "",
                "category": row[7],
                "createdAt": row[8],
            }
            for row in data_rows if len(row) >= 9
        ]

        return jsonify({"status": "ok", "data": result})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/todo GET:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/todo", methods=["POST"])
def add_todo():
    """添加单个 TODO 项"""
    try:
        data = request.get_json()
        todo_item = dataTodo(
            uuid=data.get("id", ""),
            title=data.get("title", ""),
            description=data.get("description", ""),
            completed=data.get("completed", False),
            priority=data.get("priority", "medium"),
            dueDate=data.get("dueDate", ""),
            category=data.get("category", "Personal"),
            createdAt=data.get("createdAt", ""),
        )
        
        todo_storage.append_row([
            int(todo_storage.fetch_id() + 1),
            todo_item.uuid,
            todo_item.title,
            todo_item.description,
            str(todo_item.completed),
            todo_item.priority,
            todo_item.dueDate,
            todo_item.category,
            todo_item.createdAt,
        ])

        return jsonify({"status": "ok", "data": todo_item.model_dump()})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/todo POST:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/todo", methods=["PUT"])
def save_all_todos():
    """保存所有 TODO（覆盖写入）"""
    try:
        data = request.get_json()
        if not isinstance(data, list):
            return jsonify({"status": "error", "message": "Expected array of todos"}), 400
        
        # 构建新的行数据
        header = ["id", "uuid", "title", "description", "completed", "priority", "dueDate", "category", "createdAt"]
        rows = [header]
        
        for idx, item in enumerate(data, start=1):
            rows.append([
                idx,
                item.get("id", ""),
                item.get("title", ""),
                item.get("description", ""),
                str(item.get("completed", False)),
                item.get("priority", "medium"),
                item.get("dueDate", ""),
                item.get("category", "Personal"),
                item.get("createdAt", ""),
            ])
        
        todo_storage.write_all(rows)
        
        return jsonify({"status": "ok", "count": len(data)})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/todo PUT:", e)
            raise
        else:
            return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/todo", methods=["DELETE"])
def delete_todo():
    """删除单个 TODO 项"""
    try:
        id_value = request.args.get("id")
        if not id_value:
            return jsonify({"status": "error", "message": "missing id"}), 400

        # 根据 uuid 删除
        rows = todo_storage.read_all()
        header, data_rows = rows[0], rows[1:]
        new_rows = [header] + [row for row in data_rows if len(row) > 1 and row[1] != id_value]
        todo_storage.write_all(new_rows)

        return jsonify({"status": "ok", "deleted": id_value})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/todo DELETE:", e)
            raise
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/todo", methods=["PATCH"])
def update_todo():
    """更新单个 TODO 项"""
    try:
        id_value = request.args.get("id")
        if not id_value:
            return jsonify({"status": "error", "message": "missing id"}), 400
        
        updates = request.get_json()
        if not updates:
            return jsonify({"status": "error", "message": "missing update data"}), 400
        
        rows = todo_storage.read_all()
        header, data_rows = rows[0], rows[1:]
        
        # 字段索引映射
        field_map = {
            "title": 2,
            "description": 3,
            "completed": 4,
            "priority": 5,
            "dueDate": 6,
            "category": 7,
        }
        
        updated = False
        for row in data_rows:
            if len(row) > 1 and row[1] == id_value:
                for field, idx in field_map.items():
                    if field in updates:
                        value = updates[field]
                        if field == "completed":
                            value = str(value)
                        row[idx] = value
                updated = True
                break
        
        if not updated:
            return jsonify({"status": "error", "message": "todo not found"}), 404
        
        todo_storage.write_all([header] + data_rows)
        
        return jsonify({"status": "ok", "updated": id_value})
    except Exception as e:
        if switch_mode(mode) == 0:
            print("ERROR in /api/todo PATCH:", e)
            raise
        return jsonify({"status": "error", "message": str(e)}), 400


    
if __name__ == "__main__":
    app.run(host="localhost", port=5000)
