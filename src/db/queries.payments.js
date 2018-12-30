const User = require("./models").User;
const Payment = require("./models").Payment;

module.exports = {
  //#1
  addPayment(newPayment, callback){
    return Payment.create(newPayment)
    .then((payment) => {
      callback(null, payment);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getLatestPayment(userId, callback){
    return Payment.findOne({where: {userId: userId}, order: [['createdAt','DESC']]})
    .then((payment) => {
      callback(null, payment);
    })
    .catch((err) => {
      callback(err);
    })
  }
}
