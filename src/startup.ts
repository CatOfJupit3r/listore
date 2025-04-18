import RootLoader from './loaders';

const start = async () => {
    try {
        // const app = express()
        // const server = http.createServer(app)

        await RootLoader();

        //   server.listen(SERVER_PORT, SERVER_HOST, () => {
        //       console.log(`
        //   #############################################
        //     Server listening on port: ${SERVER_PORT}
        //     Address: http://localhost:${SERVER_PORT} ️
        //   #############################################
        // `)
        //   })
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default start;
