const awsServerlessExpress = require("aws-serverless-express");
const app = require("./app");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('http').Server}
 */
const server = awsServerlessExpress.createServer(app);

const getUser = async (clientEmail) => {
  try {
    const amplifyEnv = process.env.ENV;
    const tableName = `usersTable-${amplifyEnv}`;

    const params = {
      TableName: tableName,
      Key: {
        email: clientEmail,
      },
    };

    const { Item } = await dynamoDB.get(params).promise();
    const { role, email } = Item || {};
    return { role, email };
  } catch (e) {
    return { role: undefined, email: undefined };
  }
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event;
  console.log(`EVENT: ${JSON.stringify(event)}`);

  const result = await awsServerlessExpress.proxy(
    server,
    event,
    context,
    "PROMISE"
  ).promise;

  const amplifyEnv = process.env.ENV;
  const tableName = `usersTable-${amplifyEnv}`;

  switch (httpMethod) {
    case "GET": {
      const { userEmail: clientEmail, getAll = false } =
        queryStringParameters || {};
      if (!clientEmail) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Not Found" }),
        };
      }
      const { role, email } = await getUser(clientEmail);
      if (!role || !email) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Not Found" }),
        };
      }
      if (getAll) {
        if (role !== "admin") {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Not Found" }),
          };
        }
        const params = {
          TableName: tableName,
        };

        let scanResults = [];
        let items;
        do {
          items = await dynamoDB.scan(params).promise();
          items.Items.forEach((item) => scanResults.push(item));
          params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");

        result.body = JSON.stringify({
          message: "All Users",
          data: scanResults,
        });

        return result;
      }
      result.body = JSON.stringify({
        role,
        email,
      });

      return result;
    }
    case "PUT": {
      const { email, role, userEmail: clientEmail } = JSON.parse(body);
      if (!clientEmail) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Not Found" }),
        };
      }
      const { role: clientRole, email: clientDbEmail } = await getUser(
        clientEmail
      );
      if (
        !clientRole ||
        !clientDbEmail ||
        (clientRole && clientRole !== "admin")
      ) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Not Found" }),
        };
      }
      const payload = {
        TableName: tableName,
        Item: {
          email,
          role,
        },
      };
      const data = await dynamoDB.put(payload).promise();
      console.log("User info updated", data);
      result.body = JSON.stringify({
        message: "Success",
      });
      return result;
    }
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
  }
};
