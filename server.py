from flask import Flask, render_template, redirect

app = Flask(__name__)


@app.route("/")
def index():
    return redirect("/examples")


@app.route("/examples")
def examples():
    return render_template("examples.html")


@app.route("/form")
def form():
    return render_template("form.html")


@app.route("/sidebar")
def sidebar():
    return render_template("sidebar.html")


if __name__ == "__main__":
    app.run(debug=True)
