
const axios = require('axios');
const CryptoJS = require('crypto-js');
const rocketfuel = {
    options: {
        merchantId: '9514ec97-8672-4668-bf43-8722c9fe89c2',
        clientId: '45f880085d700cab1b16a506357b6bc4459b49864933ce6a91a47f2863f630c7',
        secret: 'fdb652e4-ee6e-478d-b332-53f9c045663b',
        environment: 'sandbox'
    },
    STRING_CONST: {
        environment: {
            production: 'production',
            sandbox: 'sandbox',
        },
        endpoint: {
            production: 'https://app.rocketfuelblockchain.com/api/',
            sandbox: 'https://app-sandbox.rocketfuelblockchain.com/api/',
        },
        route: {
            auth: 'auth/generate-auth-token',
            refresh: 'auth/refresh-token',
            generateLink: 'hosted-page',

            lookup: 'purchase/invoiceLookup',
        },
        keys: {
            publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2e4stIYooUrKHVQmwztC\n/l0YktX6uz4bE1iDtA2qu4OaXx+IKkwBWa0hO2mzv6dAoawyzxa2jmN01vrpMkMj\nrB+Dxmoq7tRvRTx1hXzZWaKuv37BAYosOIKjom8S8axM1j6zPkX1zpMLE8ys3dUX\nFN5Dl/kBfeCTwGRV4PZjP4a+QwgFRzZVVfnpcRI/O6zhfkdlRah8MrAPWYSoGBpG\nCPiAjUeHO/4JA5zZ6IdfZuy/DKxbcOlt9H+z14iJwB7eVUByoeCE+Bkw+QE4msKs\naIn4xl9GBoyfDZKajTzL50W/oeoE1UcuvVfaULZ9DWnHOy6idCFH1WbYDxYYIWLi\nAQIDAQAB\n-----END PUBLIC KEY-----',
        },
    },
    rocketfuelApi: function () {
        const baseURL = this.STRING_CONST.endpoint[this.options.environment]
        const options = {};
        options.baseURL = baseURL;

        if (!options.baseURL) {
            throw new Error('Invalid baseURL');
        }

        const instance = axios.create(options);

        return instance;
    },
    setAccessToken: function (access){
        this.apiInstance.defaults.headers.common['Authorization']= `Bearer ${access}`
    },
    encrypt: async function (text, clientSecret) {
        try {
            if (typeof text === 'object') {
                text = JSON.stringify(text);
            }
            return await CryptoJS.AES.encrypt(text, clientSecret).toString();
        } catch (err) {
            throw new Error(err.message, err.response.data);
        }
    },
    auth: async function ({ clientId, encryptedPayload }) {

        if (!clientId) {
            throw new Error('ClientId is required');
        }

        if (!encryptedPayload) {
            throw new Error('Encrypted Payload is required');
        } 
        if (!this.apiInstance) {
            this.apiInstance = this.rocketfuelApi()
        }

        const url = this.STRING_CONST.route.auth;
        try {
            const { data } = await this.apiInstance.post(url, { clientId, encryptedPayload });
            this.accessToken= data.result.access;
            this.apiInstance.defaults.headers.common['Authorization']= `Bearer ${data.result.access}`
            return data;
        } catch (err) {
            throw new Error(err.message, err.response.data);
        }

    },
    generateUUID: async function (payload) {
        const url = this.STRING_CONST.route.generateLink;
        let headers = {};
        if (!this.apiInstance) {
            this.apiInstance = this.rocketfuelApi()
        }
        try {
            if (!payload || !Object.keys(payload).length) {
                throw new Error('data object cannot be empty');
            }

            if (payload.code2fa) {
                headers = { 'rf-2fa': payload.code2fa };
            }

            const { data } = await this.apiInstance.post(url, payload, { headers });
            return data;
        } catch (err) {
            return { ok: false, result: {}, err };
        }
    },
    init: async function() {
        const options = this.options
        const tokenInfo = {
            merchantId: options.merchantId,
            // totp, // Authorization code from google authenticator. Pass it if you have two-factor authentication enabled
        }
       
        const encryptedPayload = await this.encrypt(tokenInfo, options.secret);
        const authData = {
            clientId: options.clientId,
            encryptedPayload: encryptedPayload
        }
        let authRes;
        try {
            authRes = await this.auth(authData);
        } catch (error) {
            console.error({ message: 'error with authentication' });
            return;
            //silently ignore
        }
        this.setAccessToken(authRes.result.access);
    
        const payload = {
            amount: "59.97",
            merchant_id: options.merchantId,
            cart: [
                {
                    id: "23",
                    name: "Tshirt with round nect (L)",
                    price: "10",
                    quantity: "1",
                },
                {
                    id: "24",
                    name: "Flower Formal T-shirt (L)",
                    price: "15",
                    quantity: "1",
                },
                {
                    id: "25",
                    name: "Printed White Tshirt (L)",
                    price: "9",
                    quantity: "1",
                },
            ],
            currency: "USD",
            order: new Date().getTime().toString(),//order id must be a string
            redirectUrl: "", //if it is an hosted page flow, add the url you want the user to be redirected to after payment
            customerInfo: {
                name: 'Customer Name',
                email: 'dev@yopmail.com', //this should be the customer email
            }
        }
        const result = await this.generateUUID(payload);
        console.log({ result })
    }
}

async function main() {
    rocketfuel.init();
}
main();
