# Fergie Alexa Skill

## Intro

This is my first Alexa skill. I created this because even though the Amazon Echo is great, it doesn't provide any interface to get this information. This skill is still in beta and therefore is not available on the Amazon Echo skill store. You can, however, clone the repo and install this skill on your own Echo through a free developer account.

## API

This skill is currently using the [football-data api](http://www.football-data.org/documentation), which is the only free Premier League API I could find. The data is a little outdated and doesn't provide the best data, but it works for now. I'm in the process of creating my own API that will provide more information and be more up-to-date.

## Install

To install this skill on your own Amazon Echo clone the repo and follow the instructions on [Amazon's website](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function).

<!-- 1. If you do not already have an account on AWS, go to [Amazon Web Services](http://aws.amazon.com/) and create one.
2. Log in to the [AWS Management Console](http://aws.amazon.com/) and navigate to AWS Lambda.
3. Click the region drop-down in the upper-right corner of the console and select **US East (N. Virginia)**. Currently, this is the only supported region for Lambda functions used with the Alexa Skills Kit.
4. If you have no Lambda functions yet, click **Get Started Now**. Otherwise, click **Create a Lambda Function**.
5. Don't select a blueprint, instead click the **skip** button at the bottom of the page.
6. Create a name for the Lambda function. I named mine ```Fergie```.
7. The runtime should be ```Node.js```
8. The code entry type should be ```upload a .zip file```.
9. Compress all of the individual files in the ```/src``` folder into one zip file. Be sure not to compress the folder itself, but the inidivudal files. If you zip the folder the Lambda function won't work.
10. Under Handler leave the default of ```index.handler```
11. Set the role to a basic execution role. This defines the AWS resource the function can access.
12. Leave the advanced options alone.
13. On the review page, make sure that the event source is Alexa.
14. Click create function to save your new function.  -->
