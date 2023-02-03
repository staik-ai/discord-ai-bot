const init = async () => {
  process.on("unhandledRejection", (error) => {
    console.log(error);
  });
  process.on("uncaughtException", (error) => {
    console.log(error);
  });
};

module.exports = { init };
