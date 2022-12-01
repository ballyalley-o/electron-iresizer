const path = require("path");
const  os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");


process.env.NODE_ENV = "production";

//Create main window
const isDev = process.env.NODE_ENV !== "production";
const isWin = process.platform === "win32";

let mainWindow;

function createMainWin() {
  // Create the browser window.
    mainWindow = new BrowserWindow({
    title: "Image Resize",
    width: isDev ? 1000 : 650,
    height: 900,
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
    }
  });
  //open devtools window if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./render/index.html"));
}

//create about window
function createAboutWin() {
    const aboutWindow = new BrowserWindow({
      title: "About Image Resize",
      width: 300,
      height: 300,
    });

    aboutWindow.loadFile(path.join(__dirname, "./render/about.html"));
}

//app when ready
app.whenReady().then(() => {
  createMainWin();

  //Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //remove mainwindow from memory on close
mainWindow.on('close', () => (mainWindow = null));


  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWin();
    }
  });
});

// menu template
const menu = [
  ...(isWin
    ? [
        {
          label: "Image Resizer",
          submenu: [
            {
              label: "About",
              click: createAboutWin
            },
          ],
        },
      ]
    : []),

  {
    role: "fileMenu",
  },
  ...(!isWin
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWin,
            },
          ],
        },
      ]
    : []),
];

//respond to ipcRenderer resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer')
   resizeImage(options)
})

//resize image
async function resizeImage ({ imgPath, width, height, percent, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
      percentage: percent
    })

    //create filename
    const filename = path.basename(imgPath)

    //create folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }

    //write file to dest
    fs.writeFileSync(path.join(dest, filename), newPath)

    //prompt for success
    mainWindow.webContents.send('image:done')

    //open folder dest
    shell.openPath(dest)

  } catch (error) {
    toast.error('Failed to resize the image, sorry master!', error)
  }
}

app.on("window-all-closed", () => {
  if (isWin) {
    app.quit();
  }
});
