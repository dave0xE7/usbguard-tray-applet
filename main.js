const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage  } = require('electron');
const child_process = require('child_process');
const path = require('path');

var usbguard = require('./usbguard.js')

let tray = null;
let usbDevices = [];
var icon;

// Function to create the tray icon and menu
function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.png')); // Ensure you have a tray icon (e.g., "tray-icon.png")
    const contextMenu = Menu.buildFromTemplate([
        { label: 'List USB Devices', click: updateDeviceList(), icon: icon },
        { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('USBGuard Tray Menu');
}

// Update the list of USB devices and refresh the context menu
function updateDeviceList() {
    usbDevices = usbguard.list();
    // usbDetect.find((err, devices) => {
    //     if (err) {
    //         console.error('Error detecting devices:', err);
    //         return;
    //     }
    //     usbDevices = devices;
    //     listUsbDevices(); // Automatically update the list when devices change
    // });
    listUsbDevices();
}

// Function to list the USB devices in the tray menu
function listUsbDevices() {
    const deviceMenuItems = usbDevices.map(device => ({
        label: `(${device.number}) ${device.name} (${device.allowed})`,
        submenu: [
            {
                label: 'Allow',
                click: () => handleAllow(device.number)
            },
            {
                label: 'Block',
                click: () => handleBlock(device.number)
            }
        ]
        // type: 'checkbox',
        // checked: device.allowed,
        
    }));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'List USB Devices', click: listUsbDevices },
        ...deviceMenuItems,
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// When a USB device is added or removed, send the updated list of devices to the renderer process
// usbDetect.on('add', () => updateDevices());
// usbDetect.on('remove', () => updateDevices());

// Fetch the list of connected devices and send it to the renderer
function updateDevices() {
    const devices = ListDevices();
    mainWindow.webContents.send('usbDevices:update', devices);
}

// app.whenReady().then(createWindow);

// app.whenReady().then(() => {
//   const icon = nativeImage.createFromPath(path.join(__dirname,'icon.png'))
//   tray = new Tray(icon)

//   const contextMenu = Menu.buildFromTemplate([
//     { label: 'Item1', type: 'radio' },
//     { label: 'Item2', type: 'radio' },
//     { label: 'Item3', type: 'radio', checked: true },
//     { label: 'Item4', type: 'checkbox' }
//   ])

//   tray.setToolTip('This is my application.')
//   tray.setContextMenu(contextMenu)
// })

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle allowing or blocking devices via USBGuard CLI
// ipcMain.handle('usbguard:allow', (event, deviceId) => {
function handleAllow(deviceId) {
    // return runUsbGuardCommand(`usbguard rule add --allow --device ${deviceId}`);
    return runUsbGuardCommand(`usbguard allow-device ${deviceId}`);
}

ipcMain.handle('usbguard:block', (event, deviceId) => {
    return runUsbGuardCommand(`usbguard rule add --block --device ${deviceId}`);
});

// Function to run USBGuard commands
function runUsbGuardCommand(command) {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

app.whenReady().then(() => {
    icon = nativeImage.createFromPath(path.join(__dirname,'icon.png'))

    createTray();
    updateDeviceList(); // Initially populate the device list
});