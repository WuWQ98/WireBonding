# import webview
# from PythonAPI.js_api import Api
#
# if __name__ == '__main__':
#     api = Api()
#     window = webview.create_window(title="Wire Bonding", url="./build/index.html", js_api=api, width=1800, height=960)
#     webview.start(debug=True, gui='qt', http_server=True)
#     pass


import sys
import os
from PyQt5.QtCore import QUrl, QCoreApplication, QFile, pyqtSlot, QObject, QVariant
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWidgets import QMainWindow, QApplication
from PyQt5.QtWebChannel import QWebChannel
from PythonAPI.js_api import Api


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Wire Bonding")
        self.setGeometry(0, 0, 1800, 1000)
        self.browser = QWebEngineView()
        self.channel = QWebChannel()
        self.browser.page().setWebChannel(self.channel)
        self.api = Api()
        self.channel.registerObject("api", self.api)
        # url = QCoreApplication.applicationDirPath() + "/build/index.html"
        url = os.getcwd() + "/build/index.html"
        file = QFile(url)
        if not file.exists():
            print("file not exists")
            return
        self.browser.load(QUrl.fromLocalFile(url))
        self.setCentralWidget(self.browser)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

#    nuitka --standalone --show-progress --show-memory --show-modules --plugin-enable=pyqt5 --plugin-enable=numpy --output-dir=out main.py
