(() => {

  const express = require('express');
  const router = express.Router();

  router.get('/', (req: any, res: any, next: any) => {
    res.send('hitting users route');
  });

  module.exports = router;

})();
