DSPVHCLR:CMD PROMPT('Get Vehicle Data')

  PARM KWD(MODE) TYPE(*CHAR) LEN(10) RSTD(*YES) +
       VALUES(*SNDRCV *RCVONLY) DFT('*SNDRCV') +
       PROMPT('Run mode')

  PARM KWD(WAITTM) TYPE(*DEC) LEN(5 0) DFT(5) +
       PROMPT('Wait time')

  PARM KWD(REQKEY) TYPE(*CHAR) LEN(6) DFT('0     ') +
       PROMPT('Request key')
       
  PARM KWD(VIN) TYPE(*CHAR) LEN(17) DFT('5GAKRBKD9GJ289346') +
       PROMPT('VIN')

  PARM KWD(MODELYEAR) TYPE(*DEC) LEN(4) DFT(2016) +
       PROMPT('Model Year')
