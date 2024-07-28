import * as shell from "shelljs";

/**
 * When we run command "npm run build", it will not compile emails
 * folder, because the file extensions are '.ejs'. So that is why
 * we need to explicitly copy emails folder into our build
 */
shell.cp("-R", "src/emails", "build/src/");
