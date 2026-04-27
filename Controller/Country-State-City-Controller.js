
import fetch from 'node-fetch';

const CSC_API_KEY = process.env.CSC_API_KEY;

export const getCountries = async (req, res) => {
    try {
        const response = await fetch('https://api.countrystatecity.in/v1/countries', {
            headers: {
                'X-CSCAPI-KEY': CSC_API_KEY
            }
        });
        const countries = await response.json();
        res.status(200).json(countries);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStatesByCountry = async (req, res) => {
    const { countryCode } = req.params;
    try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
            headers: {
                'X-CSCAPI-KEY': CSC_API_KEY
            }
        });
        const states = await response.json();
        res.status(200).json(states);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCitiesByState = async (req, res) => {
    const { countryCode, stateCode } = req.params;


    try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
            headers: {
                'X-CSCAPI-KEY': CSC_API_KEY
            }
        });
        const cities = await response.json();
        res.status(200).json(cities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};