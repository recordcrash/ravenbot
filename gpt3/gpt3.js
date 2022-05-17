const apikey = require("../config/gpt.json").apikey;
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: apikey,
});
const openai = new OpenAIApi(configuration);

const gpt3 = async (
  prompt,
  stop = undefined, // Terminate at this string
  requestor = "makin@protonmail.com" // For compliance, all requests need to send identifying infomation
) =>
  openai.createCompletion("text-davinci-002", {
    prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    stop: stop,
    frequency_penalty: 0.6,
    user: requestor,
  });

module.exports = { gpt3 };
