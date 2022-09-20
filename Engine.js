const { exec } = require('child_process');

class Phobos {
    constructor(hostname, username, password){
        Object.assign(this, { hostname, username, password });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    status(){
        return new Promise((resolve, reject)=>{
            this.runner(`ipmitool -H ${this.hostname} -I lanplus -U ${this.username} -P ${this.password} chassis power status`)
                .then(response => { if(response.includes('on')){ return resolve(true); } return resolve(false); })
                .catch(reject);
        });
    }

    fanspeed(value){
        return new Promise(async(resolve, reject) => {
            try {
                await this.runner(`ipmitool -H ${this.hostname} -I lanplus -U ${this.username} -P ${this.password} sel clear`);
                await this.runner(`ipmitool -H ${this.hostname} -I lanplus -U ${this.username} -P ${this.password} raw 0x30 0x30 0x01 0x00`);
                await this.runner(`ipmitool -H ${this.hostname} -I lanplus -U ${this.username} -P ${this.password} raw 0x30 0x30 0x02 0xff 0x${value}`);
                resolve(true)
            } catch(err){
                return reject(false)
            }
        })
    }
    
    start(){
        return new Promise(async(resolve, reject) => {
            this.runner(`ipmitool -H ${this.hostname} -I lanplus -U ${this.username} -P ${this.password} chassis power on`).then(resolve).catch(reject);
        })
    }
    
    shutdown(){
        return new Promise((resolve, reject) => {
            this.runner(`ipmitool -H ${this.hostname} -I lanplus -U ${this.username} -P ${this.password} chassis power off`).then(resolve).catch(reject);
        })
    }
    
    runner(command){
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) { return reject(error.message); }
                if (stderr) { return reject(stderr); }
                return resolve(stdout)
            });
        })
    };
}

module.exports = Phobos;