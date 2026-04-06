const cds = require('@sap/cds'); 
const axios = require('axios'); 
module.exports = cds.service.impl(async function () { 
    this.on('getCoordinates', async (req) => { 
        const { state, country } = req.data; 

        try { 
            if (!state) { 
                const countryRes = await axios.post("https://countriesnow.space/api/v0.1/countries/states", 
                    { country }); 
                return { 
                    type: "state_list", 
                    data: countryRes.data.data.states 
                }; 
            } if (state) {
              const query = country ? `${state}, ${country}` : state;

    const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
            params: {
                state: state,
                format: "json"
            },
            headers: {
              "User-Agent": "cap-app"   
            }
        }
    );

    console.log("Geo Response:", geoRes.data); 

        if (!geoRes.data || geoRes.data.length === 0) {
          req.error(404, "Location not found");
        }

        return {
          latitude: parseFloat(geoRes.data[0].lat),
          longitude: parseFloat(geoRes.data[0].lon)
        };
}
            } catch (error) { 
                console.log(error); 
                req.error(500, "External API error"); 
            } return { 
                message: "No data found" 
            }; 
        }); 
    });