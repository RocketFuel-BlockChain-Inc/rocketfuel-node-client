
# Sample node client for Rocketfuel API

This is an example node app that shows how to generate invoice id from cart details using client id and secret. 
## SETUP
`npm install
`

## No SDK Example
If you want to try out an example without the node sdk, simply run
```node
node nosdk-example.js
```
The example code can be found in `nosdk-example.js`

## Configuration
An object `rocketfuel` is created to hold all the assets. 
Start by configuring the `options` key with your details.
Ensure to replace the existing option with yours 
``` 
options: {
        merchantId: 'YOUR_MERCHANT_ID',
        clientId: 'YOUR_CLIENT_ID',
        secret: 'YOUR_SECRET',
        environment: 'sandbox' //production
        },
```

You can also configure the payload in rocketfuel.init()
You can change all the keys except merchant_id as that already pulls in the details in the options you provided earlier.