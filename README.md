# jenlytics
A Jenkins CLI utility that shows a diff of failing tests between two builds

## Features
* Shows a diff of failing tests between two builds of same branch or different branched within a repo.
* Output retrieved displays the build name, test name and age of failing tests

## Usage
* Clone repo to preferred folder
* `CD` into folder and run `npm install`
* To run, use command `JIRA_USERNAME=YOUR_JIRA_USERNAME JIRA_PASSWORD=YOUR_JIRA_PASSWORD JENKINS_USERNAME=YOUR_JENKINS_USERNAME SERVER_URL=YOUR_JENKINS_SERVER_URL SERVER_PORT=YOUR_JENKINS_SERVER_PORT TEST_PIPELINE=YOUR_TEST_PIPELINE nohup node main.js`
  * You can add the environment variable on your system PATH so that you don't have to pass them when running
  * `nohup` allows you to store output from the terminal to a `nohub.out` file
* Once running you will be presented with a jenlytics consoles shown as `jenlytics$`
* To get a diff of the failing tests between two branches say branch `BRANCH-100` build `10` and branch `MASTER` build `50`, enter the following command: 
  * `diff BRANCH-100#10 MASTER#50` where the branch is separated with the build number by a `#` then press enter and you'll be presented with results in table format with three columns namely `Build, Test and Age`

## TODO V2+
* Make it an npm module so that it can be installed globally and executed from anywhere
* Add more features like:
  * diff newest branches of the two builds if build number specified
  * Viewing history of failing test in a branch from all past builds
  * Viewing cause of failure
  * Diff more than two diffs
  * Graphing the results
  * More analytics
* Make an desktop/web version

## Contributors
* Ken Thuku - [@ktkization] (https://github.com/ktkization)
