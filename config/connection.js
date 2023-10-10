const { default: mongoose } = require("mongoose")

const database = module.exports = () => {
    const connectionParams = {
        useNewUrlParser : true,
        useUnifiedTopology : true,
    }

    try {
        mongoose.connect('mongodb://vishnuvaliyaveetil92:8Co2EaIcaKK4qHBW@ac-yltcwsy-shard-00-00.crb6lwe.mongodb.net:27017,ac-yltcwsy-shard-00-01.crb6lwe.mongodb.net:27017,ac-yltcwsy-shard-00-02.crb6lwe.mongodb.net:27017/hospitalmanagement?ssl=true&replicaSet=atlas-14hsoe-shard-0&authSource=admin&retryWrites=true&w=majority')
        
        console.log('database connected successfully');
    } catch (error) {
        console.log('database connection failed'+error);

    }
}