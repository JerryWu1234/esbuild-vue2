import { parse } from 'path'

export const getbasename = (sourcePath: string) => parse(sourcePath).base
