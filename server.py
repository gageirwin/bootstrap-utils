from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return "Welcome to the Flask server!"


@app.route("/example/datetime")
def example_datetime():
    return render_template("example/datetime.html")


if __name__ == "__main__":
    app.run(debug=True)
