const cds = require('@sap/cds');
// const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');

module.exports = async function () {

//   this.on('fetchLocation', async (req) => {
//     const locationService = await cds.connect.to('Location_API');
//     try {
//       const country = req.data.country;

//       const result = await locationService.send({
//         method: 'GET',
//         path: `/odata/v4/location/getCoordinates(country='${country}')`
//       });
    
//       console.log(result);

//       return result;

//     } catch (error) {
//       console.error("ERROR:", error);
//       req.error(500, "Connection failed");
//     }
//   });


    const { Vehicle, Dealer, State, Order, Customer, Model } = this.entities;
    const locationService = await cds.connect.to('Location_API');

    this.before('CREATE', 'Dealer', async (req) => {
        const { ID, dealerName, address, phoneNumber, country, state } = req.data;
        if (!ID) {
            req.error(400, 'Invalid ID Format');
        }
        const dealer = await SELECT.one.from(Dealer)
            .where({ ID });
        if (dealer) {
            req.error(400, 'Dealer Already Exists')
        }
        if (!dealerName || !phoneNumber || !address) {
            req.error(400, 'Must Enter All The Fields');
        }
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            req.error(400, 'Invalid Phone Number');
        }
          try {

      const result = await locationService.send({
        method: 'GET',
        path: `/odata/v4/location/getCoordinates(country='${country}',state='${state}')`
      });

      req.data.latitude = result.latitude  || result.value?.latitude;
      req.data.longitude = result.longitude || result.value?.longitude;

    } catch (err) {
      console.error(err);
      req.error(500, 'Failed to fetch location');
    }

  });
    this.before('READ', 'Dealer', async (req) => {
        console.log('Dealer Details Fetched');
    })
    this.after('READ', 'Dealer', async (data) => {
        if (!Array.isArray(data))
            data = [data];
        for (const d of data) {
            const count = await SELECT.from(Vehicle)
                .columns('count(*) as total')
                .where({ dealer_ID: d.ID });
            d.totalVehicles = count[0].total;
        }
        console.log(data);
    });

    this.before('UPDATE', 'Dealer', async (req) => {
        const { ID } = req.data;
        if (!ID) {
            req.error(404, 'Invalid Dealer ID');
        }
        const dealer = await SELECT.one.from(Dealer).
            where({ ID });
        if (!dealer) {
            req.error(400, 'Dealer Not Found')
        }
    })
    this.before('DELETE', 'Dealer', async (req) => {
        const ID = req.params[0].ID;
        if (!ID) {
            req.error(404, 'Invalid Dealer ID');
        }
        const dealer = await SELECT.one.from(Dealer).
            where({ ID });
        if (!dealer) {
            req.error(400, 'Dealer Not Found')
        }
    })
    this.after('DELETE', 'Dealer', async (req) => {
        const ID = req.params[0].ID;
        console.log(`Dealer ID ${ID} Successfully Deleted`)
    })
    this.before('CREATE', 'Vehicle', async (req) => {
        const { Price, state_ID, model_ID } = req.data;
        if (!state_ID || !Price || !model_ID) {
            req.error(400, 'Must Fill Price And State ID');
        }
    })
    this.on('CREATE', 'Vehicle', async (req, next) => {
        const { Price, state_ID } = req.data;
        console.log(req.data)
        if (!state_ID) {
            req.error(404, 'Invalid State ID');
        }
        const st = await SELECT.one.from(State)
            .columns('ID', 'state', 'tax')
            .where({ ID: state_ID });
        if (!st) {
            req.error(404, 'State not found');
        }
        req.data.Price = Price + (Price * st.tax) / 100;
        const random = Math.floor(1000 + Math.random() * 9000);
        req.daata.ID = `${st.state}-${random}`;
        await next();
    })
    this.after('CREATE', 'Vehicle', (data) => {
        console.log(`Vehicle ID ${data.ID} Successfully Created`);
    })
    this.on('UPDATE', 'Vehicle', async (req, next) => {
        const { ID, Price: newPrice } = req.data;

        const vehicle = await SELECT.one.from(Vehicle).
            where({ ID });
        if (!vehicle) {
            req.error(404, 'Vehicle not found');
        }
        const state_ID = req.data.state_ID || vehicle.state_ID;
        if (!state_ID) {
            req.error(404, 'Invalid State ID');
        }
        const st = await SELECT.one.from(State)
            .columns('ID', 'state', 'tax')
            .where({ ID: state_ID });
        if (!st) {
            req.error(404, 'State not found');
        }
        req.data.oldPrice = vehicle.Price;
        req.data.Price = newPrice + (newPrice * st.tax) / 100;
        await next();
    })
    this.after('UPDATE', 'Vehicle', (data) => {
        console.log(`Price Updated Successfully for ${data.ID}`)

    })
    this.before('DELETE', 'Vehicle', async (req) => {
        const ID = req.params[0].ID;
        const vehicle = await SELECT.one.from(Vehicle).
            where({ ID });
        if (!vehicle) {
            req.error(404, 'Vehicle ID not found');
        }
    })
    this.after('READ', 'Vehicle', async (data) => {
        if (!Array.isArray(data))
            data = [data];
        for (const v of data) {
            if (v.dealer_ID) {
                const dealer = await SELECT.one.from(Dealer)
                    .columns('dealerName')
                    .where({ ID: v.dealer_ID });
                if (dealer) {
                    v.dealerName = dealer.dealerName;
                }
                console.log(dealer);
            }
        }

    })
    this.after('DELETE', 'Vehicle', async (data, req) => {
        const ID = req.params[0].ID;
        console.log(`Vehicle ${ID} Successfully Deleled`);
    })

    this.before('CREATE', 'State', async (req) => {
        const { state } = req.data;
        if (!/^[A-Z]{2}$/.test(state)) {
            req.error(400, 'Invalid State Format');
        }
    })
    this.on('CREATE', 'Order', async (req, next) => {
        const { customer_ID, vehicle_ID } = req.data;
        const existingOrder = await SELECT.one
            .from(Order)
            .where({ vehicle_ID });

        if (existingOrder) {
            req.error(400, 'Vehicle already assigned to another order');
        }
        if (customer_ID || vehicle_ID) {
            req.data.status = 'Approved';
        }
        await next();
    })
    this.after('READ', 'Order', async (data) => {
        for (const o of data) {
            if (o.quantity === 0) {
                o.status = 'Cancelled';
            }
        }
    })
    this.before('CREATE', 'Model', async (req) => {
        const { brand, model, modelName } = req.data;
        if (!brand || !model || !modelName) {
            req.error(400, 'Must full brand, modelName and model');
        }
    })
    this.on('CREATE', 'Model', async (req, next) => {
        const { model } = req.data;
        if (!/^[0-9]{4}$/.test(model)) {
            req.error(404, 'Invalid Model Number');
        }
        return next();
    })
    this.on('UPDATE', 'Model', async (data, req, next) => {
        const { model } = req.data;
        const ID = req.params[0].ID;
        if (!/^[0-9]{4}$/.test(model)) {
            req.error(404, 'Invalid Model Number');
        }
        return next();
    })

    this.after('CREATE', 'Model', (data) => {
        console.log(`New Model ${data.model} is Created `);
    })
    this.before('CREATE', 'Customer', async (req) => {
        const { phoneNumber } = req.data;
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            req.error(400, 'Invalid Phone Number');
        }
    })

    this.before('UPDATE', 'Customer', async (req) => {
        const ID = req.params[0].ID;
        const { phoneNumber } = req.data;
        if (phoneNumber) {
            const existingCustomer = await SELECT.one
                .from(Customer)
                .where({ phoneNumber })

            if (existingCustomer) {
                req.error(400, 'Phone number already exists')
            }
        }
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            req.error(400, 'Invalid Phone Number');
        }
    })

    };
