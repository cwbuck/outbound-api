DSPTRFCR:CMD PROMPT('Get Best Road')

  PARM KWD(MODE) TYPE(*CHAR) LEN(10) RSTD(*YES) +
       VALUES(*SNDRCV *RCVONLY) DFT('*SNDRCV') +
       PROMPT('Run mode')

  PARM KWD(WAITTM) TYPE(*DEC) LEN(5 0) DFT(5) +
       PROMPT('Wait time')

  PARM KWD(REQKEY) TYPE(*CHAR) LEN(6) DFT('0     ') +
       PROMPT('Request key')
       
  PARM KWD(TYPE) TYPE(*CHAR) LEN(10) RSTD(*YES) +
       VALUES(*TRAFFIC *INCIDENTS) DFT('*TRAFFIC') +
       PROMPT('Type')
