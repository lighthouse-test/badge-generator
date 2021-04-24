#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { badgen } = require('badgen')
let reportsPath = process.argv[2]

// Check if path for reports folder is provided, if not use current directory
if (!reportsPath) {
  reportsPath = path.join(process.cwd())
} else {
  reportsPath = path.join(process.cwd(), reportsPath)
}

// Categories for which we want to create badges
const resultCategories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa']

fs.readdir(reportsPath, (err, files) => {
  if (err) {
    console.error(err)
    process.exit()
  }

  // Get only json report files, we are not interested in any other files
  const reportFiles = files.filter(file => file.substr(file.length - 12) === '.report.json')

  // Generate warning if not files found
  if (!reportFiles.length) {
    console.warn('Lighthouse reports directory does not contain any reports.')
  }

  // Parse each file
  reportFiles.forEach(file => {
    const report = JSON.parse(fs.readFileSync(path.join(reportsPath, file)))

    // If file does not contain categories it might not be lighthouse report.
    if (!report.categories) {
      console.log('Invalid file', file)
    } else {
      console.log('\nGenerating Badges for ' + file)
      resultCategories.forEach(label => {
        // Convert lighthouse score to scale of 100
        const status = report.categories[label].score * 100
        let color
        if (status >= 90) {
          color = 'green'
        } else if (status >= 50) {
          color = 'orange'
        } else {
          color = 'red'
        }

        // Generate SVG badge
        const svg = badgen({ label, color, status: status.toString() })

        // Save SVG badge with same file name including category name and svg extension
        fs.writeFileSync(path.join(reportsPath, file.replace('report.json', label + '.svg')), svg)
      })
    }
  })
})
