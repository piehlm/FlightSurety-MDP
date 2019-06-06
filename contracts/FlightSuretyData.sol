pragma solidity >=0.4.24 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    struct AirlineProfile {
        bool isRegistered;
        bool isFunded;
    }

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping(address => AirlineProfile) private airlines;
    uint256 numAirlines;
    uint256 numFunded;
    uint256 numConsensus;
    uint256 fundAmt = 10;
    mapping(address => bool) public authorizedCallers;
    mapping(address => address[]) private regApproved;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
        ()
        public
    {
        contractOwner = msg.sender;
        airlines[contractOwner].isRegistered = true;
        airlines[contractOwner].isFunded = true;
        numAirlines = numAirlines.add(1);
        numFunded = numFunded.add(1);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireAirlineRegistered( address _airline )
    {
        require(airlines[_airline].isRegistered, "Airline is not registered");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    * @return A bool that is the current operating status
    */
    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
                            (
                                bool mode
                            )
                            external
                            requireContractOwner
    {
        require(mode != operational, "New mode must be different from existing mode");
        operational = mode;
    }

    function authorizeCaller(address callerAddress)
        external
        requireContractOwner
        requireIsOperational
    {
        authorizedCallers[callerAddress] = true;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
//----------------------------------------------------------------------------------------------
// airline functions
   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
                            (
                                address airline
                            )
                            external
                            requireIsOperational
    {
        airlines[airline].isRegistered = true;
        airlines[airline].isFunded = false;
        numAirlines = numAirlines.add(1);
    }

    /**
    * @dev determine if an address is an airline
    * @return A bool that is true if it is a funded airline
    */
    function isAirline( address airline )
                            external
                            view
                            returns(bool)
    {
        return airlines[airline].isFunded;
    }

    function GetAirlineCount() external view
    returns(uint256 count) {
        count = numAirlines;
        return count;
    }

    function GetFundedAirlineCount() external view
    returns(uint256 count) {
        count = numFunded;
        return count;
    }

   function GetNumVotes() external view
    returns(uint256 count) {
        count = numConsensus;
        return count;
    }

   function isRegisteredAirline(address _airline) external view
    returns(bool) {
        return airlines[_airline].isRegistered;
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                            )
                            public
                            payable
                            requireAirlineRegistered(msg.sender)
    {
//        require(msg.value >= 10, "Insufficient funding value.");
        // recipient.transfer(msg.value); //// TODO causes test to fail; not funded
        airlines[msg.sender].isFunded = true;
        authorizedCallers[msg.sender] = true;
        numFunded = numFunded.add(1);
        numConsensus = numFunded.div(2);
    }
//----------------------------------------------------------------------------------------------
// flight functions
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        string fltDate;
        address airline;
        string flt;
    }
    mapping(bytes32 => Flight) private flights;

    function registerFlight
    (
        address _airline,
        string memory _flt,
        string memory _date
    )
//                            external
                            public
                            requireIsOperational
                            requireAirlineRegistered(_airline)
                            returns(bool)
    {
        bytes32 key = getFlightKey(msg.sender, _flt, _date);
        require(isRegisteredFlight(key) == false, "isRegisteredFlight(key), setFlight function.");
        flights[key].isRegistered = true;
        flights[key].statusCode = 0;
        flights[key].airline = _airline;
        flights[key].flt = _flt;

//        flights[key] = Flight({
//            isRegistered : true,
//            statusCode : 0,
//            fltDate : _date,
//            airline : _airline,
//            flt : _flt
//        });
        return(isRegisteredFlight(key));
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            string memory timestamp
                        )
                        public
                        pure
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function isRegisteredFlight(bytes32 key) public view returns(bool){
        return (flights[key].isRegistered);
    }

    function getFlight(bytes32 key) public view returns(bool, uint8, address, string memory){
        return (flights[key].isRegistered, flights[key].statusCode, flights[key].airline, flights[key].flt);
    }

    /** 
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund();
    }

// Insurance functions
   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }


}

