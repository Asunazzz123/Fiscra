from flask import Flask, jsonify, request
from flask_cors import CORS
from apps.storage import Storage
from apps.data import dataItem, dataBudget
from apps.budget import Budget
from apps.utils import current_month
app = Flask(__name__)
CORS(app)


storage = Storage("data.csv")
budget = Budget("budget.json")
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
if __name__ == "__main__":
    app.run(host="localhost", port=5000)
