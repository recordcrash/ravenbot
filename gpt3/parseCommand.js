const { gpt3 } = require("./gpt3");

var mem = null;

async function getAIResponse(id, message, server, callingUser = "Person") {
  const chars = require("./characters.json").characters;
  const char = chars.find((ch) =>
    ch.name.toLowerCase().includes(id.split(",").join("").toLowerCase())
  );
  if (!char) return;
  const current = mem ? mem : "";
  const calling =
    current +
    "Person(" +
    callingUser +
    ")" +
    ":" +
    message +
    "\n" +
    char.name +
    ":";
  const response = await gpt3(
    char.prompt + calling,
    "Person",
    `server<${server}> Username:<${callingUser}>`
  );

  if (!response.data?.choices?.[0]?.text?.split(" ").join("").length) {
    return [
      {
        content: "...",
        username: char.name,
        avatar_url: char.avatar,
      },
    ];
  }
  mem = calling + response.data.choices[0].text + "\n";

  const returns = [
    {
      content: response.data.choices[0].text,
      username: char.name,
      avatar_url: char.avatar,
    },
  ];
  if (mem.length > 700) {
    mem = null;
    returns.push({
      username: "System",
      embeds: [
        {
          description:
            "Bots too powerful... Wiping memory banks... Checking [resources](https://www.patreon.com/Unexplored_Horizons)... ",
        },
      ],
      avatar_url:
        "https://discord.com/assets/509dd485f6269e2521955120f3e8f0ef.svg",
    });
  }
  return returns;
}

module.exports = { getAIResponse };
