/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  main: [
    'home',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        {type: 'autogenerated', dirName: 'get-started'}
      ]
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        {type: 'autogenerated', dirName: 'guides'}
      ]
    },
    {
      type: 'category',
      label: 'Modules',
      collapsed: false,
      items: [
        {type: 'autogenerated', dirName: 'modules'},
        {
          type: 'category',
          label: 'Examples',
          collapsed: false,
          items: [
            {
              type: 'link',
              label: 'Ethereum 1 Module', // The link label
              href: 'https://github.com/kurtosis-tech/ethereum-kurtosis-module', // The external URL
            },
            {
              type: 'link',
              label: 'Ethereum 2 Merge Module', // The link label
              href: 'https://github.com/kurtosis-tech/eth2-merge-kurtosis-module', // The external URL
            },
            {
              type: 'link',
              label: 'NEAR Module', // The link label
              href: 'https://github.com/kurtosis-tech/near-kurtosis-module', // The external URL
            },
            {
              type: 'link',
              label: 'Datastore Army Module', // The link label
              href: 'https://github.com/kurtosis-tech/datastore-army-module', // The external URL
            },
          ]
        },
      ]
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        {type: 'autogenerated', dirName: 'reference'}
      ]
    },
    {
      type: 'link',
      label: 'Changelog',
      href: 'https://docs.kurtosistech.com/kurtosis/changelog',
    },
  ],

  api: [
    'api/kurtosis-core',
    'api/kurtosis-engine'
  ]
};

module.exports = sidebars;
