
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        // User-submitted transactions
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('airline-name').value;
            let flight = DOM.elid('flight-name').value;
            let timestamp = DOM.elid('timestamp-id').value;
            // Write transaction
            contract.fetchFlightStatus(airline, flight, timestamp, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp}]);
            });
        })
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let passenger = DOM.elid('passenger-address').value;
            let airline = DOM.elid('airline-name').value;
            let flightName = DOM.elid('flight-name').value;
            let timestamp = DOM.elid('timestamp-id').value;
            let insuranceAmount = DOM.elid('ins-amount').value;

            contract.buyInsurance(airline, passenger, flightName, timestamp, insuranceAmount, (error, result) => {
                display('Buy Insurance: ',' User clicked on buy insurance button', [ { label: 'Buy Insurance: ', error: error } ]);
            })
        })
    
    });
    

})();

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}