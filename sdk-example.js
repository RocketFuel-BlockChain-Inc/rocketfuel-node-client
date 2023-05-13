const Rocketfuel = require('rocketfuel-node-sdk');
//This can only work when the sdk type is not set to module

const options = {
    merchantId: '9514ec97-8672-4668-bf43-8722c9fe89c2',
    clientId: '45f880085d700cab1b16a506357b6bc4459b49864933ce6a91a47f2863f630c7',
    secret: 'fdb652e4-ee6e-478d-b332-53f9c045663b',
    environment: 'sandbox'
}
const rocketfuel = new Rocketfuel(options.environment);

// options is required
async function main(options) {
    const tokenInfo = {
        merchantId: options.merchantId,
        // totp, // Authorization code from google authenticator. Pass it if you have two-factor authentication enabled
    }
    const encryptedPayload = await rocketfuel.encrypt(tokenInfo, options.secret);
    const authData = {
        clientId:options.clientId,
        encryptedPayload: encryptedPayload
    }
    let auth;
    try {
        auth = await rocketfuel.auth(authData.clientId, authData.encryptedPayload);
    } catch (error) {
        console.error({message: 'error with authentication'});
        return;
       //silently ignore
    }
    rocketfuel.setAccessToken(auth.result.access);

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
    const result = await rocketfuel.generateUUID(payload);
    console.log({ result })
}
main(options);
