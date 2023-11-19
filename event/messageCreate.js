/* eslint-disable no-unused-vars */
import { Message, Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import { fetch } from 'undici'
export default {
  name: Events.MessageCreate,
  /**
   * @param {Message} message
   * @returns
   */
  async execute (message) {
    if ((message.content.match('https://twitter.com/') || message.content.match('https://x.com/')) && message.content.match('status')) {
      const replaced = message.content.match(/https?:\/\/[-_.!~*\\'()a-zA-Z0-9;\\/?:\\@&=+\\$,%#]+/g)
      const embed = []

      for (let url of replaced) {
        if (url.match('https://twitter.com/')) {
          url = url.replace('twitter.com', 'api.vxtwitter.com')
        } else if (url.match('https://x.com/')) {
          url = url.replace('x.com', 'api.vxtwitter.com')
        }
        const result = await (await fetch(url)).json()
        embed.push(new EmbedBuilder()
          .setAuthor({ name: `${result.user_name} (@${result.user_screen_name})`, iconURL: result.user_profile_image_url })
          .setDescription(result.text)
          .setFields([
            {
              name: ':repeat:',
              value: String(result.retweets),
              inline: true
            },
            {
              name: ':heart:',
              value: String(result.likes),
              inline: true
            }
          ])
          .setImage(result.mediaURLs.length !== 0 ? result.mediaURLs[0] : null)
          .setTimestamp(result.date_epoch * 1000)
          .setFooter({ text: 'Twitter' })
          .setURL(result.tweetURL)
          .setColor(1941746)
        )
        if (result.mediaURLs.length === 2) {
          embed.push(new EmbedBuilder()
            .setImage(result.mediaURLs[1])
            .setURL(result.tweetURL)
          )
        } else if (result.mediaURLs.length > 2) {
          const shifted = result.mediaURLs.shift()
          for (const url of shifted) {
            embed.push(new EmbedBuilder()
              .setURL(result.tweetURL)
              .setImage(url)
            )
          }
        }
      }

      message.reply({ embeds: embed }).catch(_error => {})
    }
  }
}
