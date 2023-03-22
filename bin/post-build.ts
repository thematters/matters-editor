import path from 'path'
import fsExtra from 'fs-extra'

const { resolve, join, basename } = path
const { readFile, writeFile, copy } = fsExtra
const packagePath = process.cwd()
const distPath = join(packagePath, './dist')

const writeJson = (targetPath: string, obj: any) =>
  writeFile(targetPath, JSON.stringify(obj, null, 2), 'utf8')

async function createPackageFile() {
  const packageData = await readFile(
    resolve(packagePath, './package.json'),
    'utf8'
  )
  const { scripts, devDependencies, ...packageOthers } = JSON.parse(packageData)
  const newPackageData = {
    ...packageOthers,
    private: false,
    main: './index.cjs',
    module: './index.esm.js',
    types: './index.d.ts',
  }

  const targetPath = resolve(distPath, './package.json')

  await writeJson(targetPath, newPackageData)
  console.log(`Created package.json in ${targetPath}`)
}

async function includeFileInBuild(file: string) {
  const sourcePath = resolve(packagePath, file)
  const targetPath = resolve(distPath, basename(file))
  await copy(sourcePath, targetPath)
  console.log(`Copied ${sourcePath} to ${targetPath}`)
}

async function run() {
  try {
    await createPackageFile()
    await includeFileInBuild('./readme.md')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
