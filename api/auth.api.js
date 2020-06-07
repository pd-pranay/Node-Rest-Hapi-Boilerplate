const RestHapi = require("rest-hapi");

module.exports = function(server, mongoose, logger) {
  // Registration endpoint
  (function() {
    const Log = logger.bind("Register");
    const Admin = mongoose.model("admin");

    Log.note("Generating Registration endpoint");

    server.route({
        method: "POST",
        path: "/register/admin",
        config: {
            handler: async function(request, h) {
                const { email, password } = request.payload;
                return await RestHapi.create(Admin, { email, password }, Log);
            },
            auth: false,
            validate: {
                payload: {
                    email: RestHapi.joi
                        .string()
                        .email()
                        .lowercase()
                        .required(),
                    password: RestHapi.joi.string().required()
                }
            },
            tags: ["api", "register"],
            plugins: {
                "hapi-swagger": {}
            }
        }
    });
  })();

  // Login Endpoint
  (function() {
    const Log = logger.bind("Login");
    const Admin = mongoose.model("admin");

    const Boom = require("@hapi/boom");

    Log.note("Generating Login endpoint");

    const loginHandler = async function(request, h) {
      let token = "";
      let response = {};

      let admin = await Admin.findByCredentials(
        request.payload.email,
        request.payload.password,
        Log
      );

      if (!admin) {
        throw Boom.unauthorized("Invalid Email or Password.");
      }

      delete admin.password;

      token = server.methods.createToken(admin);

      response = {
        admin,
        token
      };

      return response;
    };

    server.route({
        method: "POST",
        path: "/login/admin",
        config: {
            handler: loginHandler,
            auth: false,
            validate: {
                payload: {
                    email: RestHapi.joi
                        .string()
                        .email()
                        .lowercase()
                        .required(),
                    password: RestHapi.joi.string().required()
                }
            },
            tags: ["api", "login"],
            plugins: {
                "hapi-swagger": {}
            }
        }
    });
  })();
};
