var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address, {from: config.owner});
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

    let op = await config.flightSuretyData.isOperational();
    
    if (op == true) {
        await config.flightSuretyData.setOperatingStatus(false, {from: config.owner});
    }

    let reverted = false;
    try 
    {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {
        reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

    // Set it back for other tests to work
    op = await config.flightSuretyData.isOperational();
    if (op == false) {
        await config.flightSuretyData.setOperatingStatus(true, {from: config.owner});
    }
  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyApp.isAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 
  it(`(First Airline) is registered when contract is deployed`, async function () {
    // Determine if Airline is registered
    let result = await config.flightSuretyData.isRegisteredAirline.call(config.owner);
    assert.equal(result, true, "First airline was not registed upon contract creation");
  });

  it('(airline) testing registerAirline() for the first 4 airlines ', async () => {
    /* 
        4 additional ailines witht the owner airline = 5 airlines in total
        which men the last airline will not be accepted 
        until 50% of the active airlines voted for it
    */
    // ARRANGE
    let newAirline2 = accounts[2];
    let newAirline3 = accounts[3];
    let newAirline4 = accounts[4];
    let newAirline5 = accounts[5];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline2, {from: config.owner});
        await config.flightSuretyApp.registerAirline(newAirline3, {from: config.owner});
        await config.flightSuretyApp.registerAirline(newAirline4, {from: config.owner});
    }
    catch(e) {
        console.log(e.message)
    }
    let resultnewAirline2 = await config.flightSuretyData.isRegisteredAirline.call(newAirline2); 
    let resultnewAirline3 = await config.flightSuretyData.isRegisteredAirline.call(newAirline3); 
    let resultnewAirline4 = await config.flightSuretyData.isRegisteredAirline.call(newAirline4); 
    let resultnewAirline5 = await config.flightSuretyData.isRegisteredAirline.call(newAirline5); 

    // ASSERT
    assert.equal(resultnewAirline2, true, "2nd airlines should be accepted automatically");
    assert.equal(resultnewAirline3, true, "3rd airlines should be accepted automatically");
    assert.equal(resultnewAirline4, true, "4th airlines should be accepted automatically");
    assert.equal(resultnewAirline5, false, "The 5th airline forword should have 50% votes before being accepted");

  });

  it('(airline)(multiparty) testing the voting system for registerAirline() for the 5th airline ', async () => {

    // ARRANGE
    let newAirline2 = accounts[2];
    let newAirline3 = accounts[3];
    let newAirline4 = accounts[4];
    let newAirline5 = accounts[5];
  
    await config.flightSuretyApp.fund({from: newAirline2, value: 10});
    await config.flightSuretyApp.fund({from: newAirline3, value: 10}); 
    await config.flightSuretyApp.fund({from: newAirline4, value: 10}); 

    console.log("Number of airlines : "+ await config.flightSuretyData.GetAirlineCount());
    console.log("Funded airlines count: "+ await config.flightSuretyData.GetFundedAirlineCount());
        
    assert.equal(await config.flightSuretyApp.isAirline.call(newAirline2), true, "second airline is not funded yet.");
    assert.equal(await config.flightSuretyApp.isAirline.call(newAirline3), true, "third airline is not funded yet.");
    assert.equal(await config.flightSuretyApp.isAirline.call(newAirline4), true, "fourth airline is not funded yet.");

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline5, {from: newAirline2});
    }
    catch(e) {
        console.log(e.message)
    }
    let resultnewAirline5 = await config.flightSuretyData.isRegisteredAirline.call(newAirline5); 
    // ASSERT
    assert.equal(resultnewAirline5, true,  "The 5th airline should be accepted after getting 2 votes out of 4");
    });

// Flight Tests
    it('(airline) register flight for an airline', async () => {
       // ARRANGE
      let newAirline2 = accounts[2];
      
      assert.equal(await config.flightSuretyApp.isAirline.call(newAirline2), true, "second airline is not funded yet.");
  
      // ACT
      try {
        await config.flightSuretyApp.registerFlight(newAirline2, "1234", "2019-06-12", {from: newAirline2});
      }
      catch(e) {
          console.log(e.message)
      }
      // ASSERT
      let resultnewAirline2 = await config.flightSuretyData.isRegisteredFlight(await config.flightSuretyData.getFlightKey(accounts[2], "1234", "2019-06-12"));
      console.log(resultnewAirline2);
      assert.equal(resultnewAirline2, true,  "The flight was not registered");
    });

    it('Passengers can choose from a fixed list of flight numbers', async() =>{
      let flight = await config.flightSuretyData.getFlight.call(await config.flightSuretyData.getFlightKey(accounts[2], "1234", "2019-06-12"));
        console.log(flight[0]);
        console.log(flight[1]);
        console.log(flight[2]);
        console.log(flight[3]);
        console.log(flight[4]);    
    });

    it('Passengers may pay up to 1 ether for purchasing flight insurance.', async()=>{
        let pass = accounts[6];
        await config.flightSuretyApp.buyInsurance(accounts[2], pass, "1234", "2019-06-12", {value: 1});
    });

    it('Passengers can see their insurance', async() =>{
        let pass = accounts[6];
        let fltKey = await config.flightSuretyData.getFlightKey(accounts[2], "1234", "2019-06-12");
        let ins = await config.flightSuretyData.getInsurance.call(fltKey, pass);
          console.log(ins[0]);
          console.log(ins[1]);
      });
 
});
