// Step 1: Get Access Token
// Please provide the following information:
// - Endpoint permalink for generating access token (default: $e/Auth/generateAccessToken)
// - Any predefined data required for this step (e.g., client_id, client_secret, etc.)

// Step 2: Get All Accounts
// Please provide the following information:
// - Endpoint permalink for getting all accounts
// - Any predefined data required for this step
// - Specify if any data from the previous step (access token) should be used in the Authorization header as 'Bearer <access-token>'

async function GetAllAccounts(workflowCtx, portal) {
  return {
    "Step 1": {
      name: "Guide",
      stepCallback: async () => {
        return workflowCtx.showContent(`
This API Recipe demostrates how to get all accounts.

## Step 1
In step 1 you will generate an access token. You will need to provide the relevant data in order to generate a token successfully. After a successful token is generated, this acess token will be automatically added in the next step.

## Step 2
The access token generated in the step 1 will be automatically included in this step. You will need to provide the relevant data to make a successsful api call.
`);
      },
    },
    "Step 2": {
      name: "Generate Access Token",
      stepCallback: async (stepState) => {
        await portal.setConfig((defaultConfig) => ({
          ...defaultConfig,
        }));
        return workflowCtx.showEndpoint({
          endpointPermalink: "$e/Auth/generateAccessToken",
          args: {
            clientId: "your_client_id",
            secret: "your_client_secret",
          },
          verify: (response, setError) => {
            if (response.StatusCode == 401 || response.StatusCode == 400) {
              setError("Authentication Token is Required");
              return false;
            } else if (response.StatusCode == 200 || response.StatusCode == 201) {
              return true;
            } else {
              setError(
                "API Call wasn't able to get a valid response. Please try again."
              );
              return false;
            }
          },
        });
      },
    },
    "Step 3": {
      name: "Get All Accounts",
      stepCallback: async (stepState) => {
        const step2State = stepState?.["Step 2"];
        await portal.setConfig((defaultConfig) => {
          return {
            ...defaultConfig,
            auth: {
              ...defaultConfig.auth,
              "Authorization": {
                ...defaultConfig.auth["Authorization"],
                "Authorization": step2State?.data?.token?.accessToken,
              }
            },
          };
        });
        return workflowCtx.showEndpoint({
          endpointPermalink: "$e/Accounts/getAllAccounts",
          verify: (response, setError) => {
            if (response.StatusCode == 401 || response.StatusCode == 400) {
              setError("Authentication Token is Required");
              return false;
            } else if (response.StatusCode == 200) {
              return true;
            } else {
              setError(
                "API Call wasn't able to get a valid response. Please try again."
              );
              return false;
            }
          },
        });
      },
    }
  };
} 