#!/usr/bin/env node
// Process tasks from the work queue
const amqp = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

const rabbitConnectionString = `amqp://${process.env.RABBIT_MQ_USERNAME}:${process.env.RABBIT_MQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}`

amqp.connect(rabbitConnectionString).then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    let ok = ch.assertQueue(process.env.RABBIT_MQ_QUEUE, {durable: true});
    ok = ok.then(function() { ch.prefetch(1); });
    ok = ok.then(function() {
      ch.consume(process.env.RABBIT_MQ_QUEUE, doWork, {noAck: false});
      console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
    return ok;

    function doWork(msg) {
      console.log("Received Message! Working...");
      setTimeout(function() {
        console.log(" [x] Done");
        ch.ack(msg);
      }, process.env.WORKING_TIME * 1000);
    }
  });
}).catch(console.warn);