import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.initialize(callback);
    }

    async initialize(callback) {
        const flts = [['123','231','334'] , ['111','222','333'] , ['321','223','012'], ['577','632', '010']];
        let accts = await this.web3.eth.getAccounts();
        this.owner = accts[0];
        this.passenger = accts[11];

        console.log("Owner: "+ this.owner);
        console.log("Passenger: "+ this.passenger);

        try{
            console.log("this.config.appAddress:   "+this.flightSuretyApp.address);
            console.log("Operating Status:   " + await this.flightSuretyApp.methods.isOperational.call());
            await this.flightSuretyData.methods.authorizeCaller(this.flightSuretyApp.address);
        }catch(error){
            console.log(error);
        }

        this.airlines.push(accts[0]);
        this.airlines.push(accts[1]);
        this.airlines.push(accts[2]);
        this.airlines.push(accts[3]);

        console.log("Airlines: "+this.airlines);
        for(let i = 0; i< this.airlines.length; i++){
// register Airlines
            if (i > 0) {
                try{
                    console.log(await this.flightSuretyApp.methods.registerAirline(this.airlines[i]).call({from: this.owner}));
                    console.log(this.airlines[i]);
                }catch(error){
                    console.log(error);
                }
                try{
                    await this.flightSuretyApp.methods.fund().call({from: this.airlines[i], value: this.web3.utils.toWei('10','ether'), gas:1500000});
                }catch(error){
                    console.log(error);
                }    
            }
// register flights for airlines
            try {
                console.log(await this.flightSuretyApp.methods.registerFlight(this.airlines[i], flts[i][0], "2019-06-12").call({from: this.airlines[i]}));
                console.log(flts[i][0]);
            }
            catch(e) {
                console.log(e.message)
            }
            try {
                console.log(await this.flightSuretyApp.methods.registerFlight(this.airlines[i], flts[i][1], "2019-06-13", {from: this.airlines[i]}));
                console.log(flts[i][1]);
            }
            catch(e) {
                console.log(e.message)
            }
            try {
                console.log(await this.flightSuretyApp.methods.registerFlight(this.airlines[i], flts[i][2], "2019-06-15", {from: this.airlines[i]}));
                console.log(flts[i][2]);
            }
            catch(e) {
                console.log(e.message)
            }
        }
        callback();
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods.isOperational()
            .call({ from: self.owner}, callback);
    }
    GetAirlineCount(callback) {
        let self = this;
        self.flightSuretyApp.methods.GetAirlineCount()
             .call({ from: self.owner}, callback);
     }
     isRegisteredAirline(airline, callback) {
        let self = this;
        self.flightSuretyApp.methods.isRegisteredAirline(airline)
             .call({ from: self.owner}, callback);
     }
     isAirline(airline, callback) {
        let self = this;
        console.log("isairline: "+airline);
        self.flightSuretyApp.methods.isAirline(airline)
             .call({ from: self.owner}, callback);
     }
     buyInsurance(airline, passenger, flightName, timestamp, insuranceAmount, callback){
        let self = this;
        console.log("buy insurance: "+self.owner);
        self.flightSuretyApp.methods.buyInsurance(airline, passenger, flightName, timestamp)
        .send({from: passenger, value: insuranceAmount}, (error, result) => {
            callback(error, result);
        });
    }

    fetchFlightStatus(airline, flight, timestamp, callback) {
        let self = this;
        let payload = {
            airline: airline,
            flight: flight,
            timestamp: timestamp
        }
        self.flightSuretyApp.methods.fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}