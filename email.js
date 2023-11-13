const { ImapFlow } = require("imapflow");
const simpleParser = require("mailparser").simpleParser

const deleteUnseenEmails = async (user, pass) => {
    let client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: user,
            pass: pass
        }
    });
    await client.connect();

    let result = false;

    await client.mailboxOpen("INBOX");

    try {//delete messages that are unseen
        result = await client.messageDelete({ seen: false });
    } catch (error) {
        console.error(error);
    } finally {
        await client.mailboxClose();
    }
    await client.logout();

    return result;
};

const getLastEmail = async (user, pass) => {
    debugger
    let client = new ImapFlow({
        host: "imap.gmail.com",//constant depending on service
        port: 993,
        secure: true,
        auth: {
            user: user,
            pass: pass
        }
    })
    await client.connect()

    let message

    let lock = await client.getMailboxLock("INBOX")

    try { //taking latest message
        message = await client.fetchOne(client.mailbox.exists, { source: true })
    } finally {
        lock.release()
    }

    await client.logout()

    if (!message) {
        console.log('Failure')
        return message
    } else {
        console.log('Success')
        return {
            uid: message.uid,
            source: message.source //email data - text, html, subject in raw form
        }
    }
}

const parseEmail = async (message) => {
    const source = Buffer.from(message.source)
    const mail = await simpleParser(
        source
    )//raw data converted into an object
    return { //object with data needed for testing
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        attachments: mail.attachments
    }
}

module.exports = {
    getLastEmail,
    deleteUnseenEmails,
    parseEmail
}
