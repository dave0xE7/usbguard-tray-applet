const child_process = require('child_process');


function ListDevices() {
    let devices = [];
    let lines = child_process.execSync('usbguard list-devices').toString().split('\n');
    lines.forEach((line)=>{
        // console.log(line);
        
        try {
            if (line !== "") {
                let numberText = line.split(':')[0];
                let number = parseInt(numberText);
                let allowText = line.slice(2+numberText.length).split(" ")[0];
                let allowed = allowText.startsWith("allow");
                // let id = line.
                
                devices.push({
                    number: number,
                    allowed: allowed,
                    id: line.split('id ')[1].split(' ')[0],
                    serial:  line.split(' serial "')[1].split('" ')[0],
                    name:  line.split(' name "')[1].split('" ')[0],
                    hash:  line.split(' hash "')[1].split('" ')[0],
                    parent:  line.split('parent-hash "')[1].split('" ')[0],
                    port:  line.split('via-port "')[1].split('" ')[0],
                    type: line.split('with-connect-type "')[1].split('"')[0]
                })           
            } 
        } catch (error) {
            console.log(error.toString());
            
        }

    });
    return devices;
}
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


function HandleAllow(id) {
    return runUsbGuardCommand("usbguard allow-device "+id);
}
function HandleBlock(id) {
    return runUsbGuardCommand("usbguard block-device "+id);
}


module.exports = {
    list: ListDevices,
    allow: HandleAllow,
    block: HandleBlock
}