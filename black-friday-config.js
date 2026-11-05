/* Campanie activă imediat. Pentru oprire: BLACK_FRIDAY_ENABLED: false.
   Opțional: completează ambele date ISO cu offset Europe/Bucharest pentru programare.
   Cu ambele date null, campania rămâne activă până la dezactivarea manuală. */
window.HEAVEN_BLACK_FRIDAY = Object.freeze({
  BLACK_FRIDAY_ENABLED: true,
  BLACK_FRIDAY_START: null,
  BLACK_FRIDAY_END: null,
  BLACK_FRIDAY_PREVIEW: false,
  TIME_ZONE: 'Europe/Bucharest'
});
