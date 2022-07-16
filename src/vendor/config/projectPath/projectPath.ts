import { dirname } from "path"
import localEnv from "vendor/helpers/env/localEnv/localEnv"
import pkgJsonPath from "../pkgJsonPath/pkgJsonPath"

export default localEnv ? dirname(pkgJsonPath) : ""
