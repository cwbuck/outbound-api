import { ECCHandlerFunction } from '@eradani-inc/ecc-router/types';
import axios from 'axios';
import config from 'config';
import createLogger from 'src/services/logger';
const logger = createLogger('commands/weather');
const { weather } = config;
import * as converter from 'src/interfaces/wthfrcapi';

const axiosInstance = axios.create(weather);

export const getForecast: ECCHandlerFunction = async (reqkey, data, ecc) => {
  // Get parameters from incomming data buffer
  const rpgFields = converter.convertLocationToObject(data);

  const reqFields = {
    ...rpgFields,

    // Add api key
    appid: weather.apikey,

    // Add constraints
    exclude: "current,minutely,hourly",
    units: "imperial",
  }

  // Call web service
  let result;
  let nextReqKey = reqkey;
  try {
    result = await axiosInstance.get("onecall", { params: reqFields });
  } catch (err) {
    if (err.response) {
      // If the request was made and the server responded with a status code
      // That falls out of the range of 2xx
      // Note: These error formats are dependent on the web service
      return ecc.sendObjectToCaller(
        {
          MsgId: "ECC1000",
          MsgTime: new Date(),
          MsgDesc: err.response.data.message,
        },
        converter.convertObjectToEccResult,
        nextReqKey
      );
    }

    // Else the request was made but no response was received
    // Note: This error format has nothing to do with the web service. This is
    // Mainly TCP/IP errors.
    return ecc.sendObjectToCaller(
      {
        MsgId: "ECC1000",
        MsgTime: new Date(),
        MsgDesc: err.message,
      },
      converter.convertObjectToEccResult,
      nextReqKey
    );
  }

  // Send success result to client
  nextReqKey = await ecc.sendObjectToCaller(
    {
      MsgId: "ECC0000",
      MsgTime: new Date(),
      MsgDesc: "Success",
    },
    converter.convertObjectToEccResult,
    nextReqKey
  );

  logger.debug("Unmapped forecast received:");
  logger.debug(JSON.stringify(result.data.daily));

  // Reduce response to an array of forecasts
  const forecasts = result.data.daily.map((obj: any) => {
    return {
      date: new Date(obj.dt * 1000),
      min: obj.temp.min,
      max: obj.temp.max,
      description: obj.weather[0].description,
    };
  });

  logger.debug("Forcasts received:");
  logger.debug(JSON.stringify(forecasts));

  // Send array of forecasts back to client
  return ecc.sendObjectsToCaller(
    forecasts,
    converter.convertObjectToForecast,
    nextReqKey
  );
};
