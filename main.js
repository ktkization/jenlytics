const vorpal = require('vorpal')();
const Table = require('cli-table');
const fetch = require('node-fetch');
const _ = require('underscore');
const colors = require('colors/safe');
const ora = require('ora');
const spinner = ora('Loading diff...');

const BASE_URL = `http://${process.env.JENKINS_USERNAME}:${process.env.JENKINS_PASSWORD}@${process.env.SERVER_URL}:${process.env.SERVER_PORT}/`;
const TEST_PIPELINE = process.env.TEST_PIPELINE;

async function getJenkinsCrumb() {
    try {
        let response = await fetch(`${BASE_URL}crumbIssuer/api/json`);
        let crumb = (await response.json()).crumb
        return crumb;
    } catch (error) {
        spinner.fail('Could not authenticate Jenkins!! Ensure correct Jenkins Creadentials are set and internet connection is present');
    }
}

async function getFailingTests(branch, build) {
    try {
        let response = await fetch(`${BASE_URL}job/${TEST_PIPELINE}/job/${branch}/${build}/testReport/api/json?pretty=true&
        tree=suites[cases[className,name,age,status]]`, {
            headers: {
                'Jenkins-Crumb': await getJenkinsCrumb()
            }
        });
        let testReports = (await response.json()).suites;
        let failingTests = [];
        for( let report of testReports) {
            for(let testCase of report.cases) {
                if (testCase.status === 'FAILED' || testCase.status === 'REGRESSION') {
                    failingTests.push(testCase);
                }
            }
        }
        return failingTests;
    } catch (error) {
        spinner.fail(`Could not get branch ${branch} or build ${build} !! Ensure branch and build exists and internet connection present`);
    }
}

function getDiffFailingTests(firstBuild, secondBuild) {

    try {
        let firstBuildTestNames = firstBuild.map( test => { return test.name });
        let secondBuildTestNames = secondBuild.map( test => { return test.name });
    
        let matchingTestNames= _.intersection(firstBuildTestNames, secondBuildTestNames);
    
        let diffResults = firstBuild.filter( test => {
            if(!matchingTestNames.includes(test.name)) {
                return test;
            }
        })
    
        return diffResults;
    } catch (error) {
        spinner.fail('Could not get diff!! Ensure branch and build exists');
    }
}

async function main() {
    process.stdout.write ("\u001B[2J\u001B[0;0f");
    vorpal
        .command('diff <build1> <build2>', 'Show diff between two Jenkins builds. Example "diff BRANCH_2#10 BRANCH-2#20" where "#" separates branch from build number.')
        .validate((args) => {
            if((args.build1.includes('#') && args.build1.split('#').length === 2) 
            && (args.build2.includes('#') && args.build2.split('#').length === 2)) {
                args.build1 = args.build1;
                args.build2 = args.build2;
                return true;
            } else {
                return 'Error in parsing input!! Esure branches are separated from build numbers with # i.e BRANCH_2#10';
            }
        })
        .action(async (args, callback) => {
            //process.stdout.write ("\u001B[2J\u001B[0;0f");
            const $this = vorpal.activeCommand
            spinner.start()

            let firstBuildParams = args.build1.split('#');
            let secondBuildParams = args.build2.split('#');
            let firstBuild = await getFailingTests(firstBuildParams[0], firstBuildParams[1]);
            let secondBuild = await getFailingTests(secondBuildParams[0], secondBuildParams[1]);
           
            let diff = getDiffFailingTests(firstBuild, secondBuild);
            
            if(diff && diff.length > 0) {
                spinner.succeed(`Diff found between branch ${firstBuildParams[0]}, build ${firstBuildParams[1]} and branch ${secondBuildParams[0]}, build ${secondBuildParams[1]}`);

                const table = new Table({
                    head:[colors.yellow.dim.bold('Class'), colors.yellow.dim.bold('Name'), colors.yellow.dim.bold('Age')]
                });
                
                for(let df of diff) {
                    let className = df.className.split('.')
                    table.push( [className[className.length-1], df.name, df.age] );
                }

                $this.log(table.toString());
            } else {
                spinner.warn('No diff found!!');
            }

            callback();
        });

    vorpal
        .delimiter('jenlytics$')
        .show()
}

main();