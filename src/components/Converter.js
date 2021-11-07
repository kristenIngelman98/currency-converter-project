import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Converter = () => {
    const [countryInfo, setCountryInfo] = useState([]); // array of array's with [currency_name, currency_code]

    const [sourceCurrency, setSourceCurrency] = useState('CAD'); // starting out with CAD currency
    const [destinationCurrency, setDestinationCurrency] = useState('EUR'); // starting out with EUR currency

    const [sourceAmt, setSourceAmt] = useState(); // amount of $ to convert
    const [destinationAmt, setDestinationAmt] = useState(); // amount of $ converted to new currency

    useEffect(() => {
        let currency_code = '';
        let currency_name = '';

        let nameArray = []; // array created for currency names
        let codeArray = []; // array created for currency codes
        let combinedArray = []; // array created to concatenate currency name & code [[name, code], [name, code]]

        axios.get('https://restcountries.com/v3.1/all')
            .then(response => {
                // loop to get response data from rest countries API and create nameArray and codeArray
                for (let i = 0; i < response.data.length; i++) {
                    if (!response.data[i].currencies) {
                        // console.log('no currency provided'); // if currency is not included in country details, skip. 
                    } else {
                        currency_code = Object.keys(response.data[i].currencies); //get country currency code from Object key
                        currency_name = Object.values(response.data[i].currencies);

                        // check if name & code are already in arrays (lots of duplicate currency names & codes)
                        if (!nameArray.includes(currency_name[0].name) && !codeArray.includes(currency_code[0])) {
                            nameArray.push(currency_name[0].name);
                            codeArray.push(currency_code[0]);
                        }
                    }
                }

                // loop to create combined_info array [name, code] and push into CombinedArray [[name, code], [name, code]]
                for (let i = 0; i < nameArray.length; i++) {
                    let combined_info = [nameArray[i], codeArray[i]];
                    combinedArray.push(combined_info);
                }
                combinedArray.sort(); // sort in alphabetical order
                setCountryInfo(combinedArray);
            })

    }, [sourceCurrency, destinationCurrency, sourceAmt, destinationAmt]); //check that sourceCurrency and destinationCurrency update

    const handleSourceChange = (event) => {
        // set selected source country currency
        setSourceCurrency(event.target.value);
    }

    const handleDestinationChange = (event) => {
        // set selected destination country currency
        setDestinationCurrency(event.target.value);
    }

    const handleAmount = (event) => {
        // set selected source $ amount
        setSourceAmt(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        let float_amount = parseFloat(sourceAmt);

        if (!sourceAmt) {
            alert("Please enter a $ amount.")
        } else if (isNaN(float_amount)) {
            alert("Amount must be a number. Try again.")
        }
        else {
            getExchangeRate(); // call getExchangeRate
        }
    }

    const getExchangeRate = () => {
        const API_KEY = process.env.REACT_APP_API_KEY;
        axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${sourceCurrency}`)
            .then(response => {
                let currency_rate = response.data.conversion_rates;
                setDestinationAmt(sourceAmt * currency_rate);
    
                for (const [key, value] of Object.entries(currency_rate)) {
                    if (key === destinationCurrency) { // using obj key to get currency rate value
                        setDestinationAmt((sourceAmt * value).toFixed(2) + " " + destinationCurrency); //2 decimal places
                    }
                }
            })
    }

    return (
        <div className="converter_wrapper">
            <h1>Currency Converter</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Convert From:
                    <select value={sourceCurrency} onChange={handleSourceChange}>
                        {!countryInfo ? <p></p> : countryInfo.map((info) => <option key={info} value={info[1]}>{info[0]}</option> )}
                    </select>

                </label><br></br>

                <label>
                    Amount to convert:
                    <input type="text" placeholder="E.g. 20" onChange={handleAmount} />
                </label><br></br>

                <label>
                    Convert To:
                    <select value={destinationCurrency} onChange={handleDestinationChange}>
                        {!countryInfo ? <p></p> : countryInfo.map((info) => <option key={info} value={info[1]}>{info[0]}</option> )}
                    </select>
                </label><br></br>

                <input className="convert_button" type="submit" value="Convert" />
            </form>
            <div className="result">{!destinationAmt ? <p>$0.00</p> : <p>${destinationAmt}</p>}</div>
        </div>
    )
}

export default Converter;