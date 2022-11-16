#!/usr/bin/env node
const { program } = require("commander");
const inquirer = require("inquirer");
const shell = require("shelljs");
const ora = require("ora");
const download = require("download-git-repo");
const { errLog, successLog, infoLog } = require("../src/utils/log.js");

const handleDownAndInitProject = (projectName, platform) => {
  const downloadUrlMap = {
    Client: "direct:https://github.com/FourKress/client-demo",
    System: "direct:https://github.com/FourKress/client-package",
  };
  const spinner = ora();
  spinner.start("正在下载模板...");
  download(downloadUrlMap[platform], projectName, { clone: true }, (err) => {
    if (err) {
      spinner.fail("模板下载失败");
      errLog(err);
    } else {
      spinner.succeed("模板下载成功");
      spinner.start("初始化Git仓库: ");
      shell.exec(
        `
                  cd ${projectName}
                  git init
                `,
        (error) => {
          if (error) {
            spinner.fail("git 仓库初始化失败 请自行检查!");
          }
          spinner.succeed("初始化Git仓库完成");
          successLog("项目初始化完成");
          infoLog(`Please: cd ${projectName} && yarn install`);
        }
      );
    }
  });
};

program
  .command("create <projectName>")
  .description("create a new project")
  .option("-C, --Client", "Client template")
  .option("-S, --System", "System template")
  .action(async (projectName, options) => {
    successLog(`projectName: ${projectName}`);
    let platform = Object.keys(options)[0];
    if (platform) {
      successLog(`platform: ${platform}`);
      handleDownAndInitProject(projectName, platform);
    } else {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "platform",
          message: "请选择模板类型",
          choices: ["Client", "System"],
        },
      ]);
      platform = answer.platform;
      successLog(`platform: ${platform}`);
      handleDownAndInitProject(projectName, platform);
    }
  });

program.version(require("../package.json").version).parse(process.argv);
