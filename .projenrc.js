const {awscdk, RenovatebotScheduleInterval} = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
    author: 'Tony Ayres',
    authorAddress: 'tayres@gmail.com',
    cdkVersion: '2.39.1',
    defaultReleaseBranch: 'main',
    name: 'zeebe-cdk-constructs',
    repositoryUrl: 'https://github.com/tjayr/zeebe-cdk-constructs.git',
    gitignore: ['.idea'],
    keywords: ['cdk', 'aws-cdk', 'awscdk', 'camunda', 'zeebe'],
    stability: 'experimental',

    // deps: [],                /* Runtime dependencies of this module. */
    // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
    // devDeps: [],             /* Build dependencies for this module. */
    // packageName: undefined,  /* The "name" in package.json. */

    releaseBranches: 'main',
    releaseToNpm: true,
    releaseWorkflow: true,

    //releaseTrigger: ReleaseTrigger.manual(),

    // publishToMaven: {
    //   javaPackage: 'com.github.tjayr.zeebe',
    //   mavenGroupId: 'com.github.tjayr',
    //   mavenArtifactId: 'zeebe-cdk-constructs',
    // },
    renovatebot: true,
    renovatebotOptions: {
        scheduleInterval: [RenovatebotScheduleInterval.WEEKENDS],
    },
    docgen: true,
    dependabot: false,
    //release: false,
    buildWorkflow: false,
    githubOptions: {
        pullRequestLintOptions: {
            semanticTitleOptions: {
                types: ['chore', 'feat', 'fix', 'ci', 'docs', 'build', 'style', 'refactor', 'perf', 'test'],
            },
            semanticTitle: true,
        },
    },

    workflowBootstrapSteps: [{
        name: 'env_setup',
        run: 'echo Set environment vars',
        env: {
            CDK_DEFAULT_ACCOUNT: '${{secrets.CDK_DEFAULT_ACCOUNT}}',
            CDK_DEFAULT_REGION: 'eu-west-1',
        },
    }],
});


project.synth();
