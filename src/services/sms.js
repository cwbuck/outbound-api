const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { twilio, ecclient } = require("../config");
const {
  convertSMSDataToObject,
  convertObjectToResult
} = require("./smsapi");
const { ECClient } = require("@eradani-inc/ec-client");

const ecc = new ECClient(ecclient);
const client = require('twilio')(twilio.accountSid, twilio.authToken);

const openRequests = {};

if (twilio.requireReply) {
  startServer();
}

exports.confirmSMS = async (reqkey, data) => {
  // get parameters from incomming data buffer
  const smsData = convertSMSDataToObject(data);

  // call web service
  let result;
  let nextReqKey = reqkey;
  try {
    result = await client.messages
      .create({
        body: `**IBM i Confirmation Requested**\n\nReason: ${smsData.reason}\n\nReply "CANCEL" to cancel the operation.\n\nReply anything else to confirm and proceed.`,
        from: twilio.fromNumber,
        to: smsData.toNumber
      });
  } catch (err) {
    if (err) {
      // If the request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // Note: These error formats are dependent on the web service
      nextReqKey = await ecc.sendObjectToCaller(
        {
          smsStatus: err.error_code.toUpperCase(),
          smsNumber: smsData.toNumber,
          message: err.error_message
        },
        convertObjectToResult,
        nextReqKey
      );
    }

    // Else the request was made but no response was received
    // Note: This error format has nothing to do with the web service. This is
    // mainly TCP/IP errors.
    return ecc.sendObjectToCaller(
      {
        smsStatus: 'ERROR',
        smsNumber: smsData.toNumber,
        message: err.message || 'Failed to send SMS'
      },
      convertObjectToResult,
      nextReqKey
    );
  }

  if (!twilio.requireReply) {
    // Send the result info
    return ecc.sendObjectToCaller(
      {
        smsStatus: 'SUCCESS',
        smsNumber: smsData.toNumber,
        message: 'SMS Sent Successfully'
      },
      convertObjectToResult,
      nextReqKey
    );
  } else {
    openRequests[smsData.toNumber] = nextReqKey;
  }
};

function startServer() {
  const app = express();

  app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    console.log(req);
    console.log(req.body);

    twiml.message('Confirmation Received. Proceeding with operation.');

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });

  http.createServer(app).listen(twilio.replyPort, () => {
    console.log('Twilio reply server listening on port ' + twilio.replyPort);
  });
}