import { replace } from 'replace-in-file';

const options = {
  files: 'dist/index.html',
  from: [/src="\//g, /href="\//g],
  to: ['src="/firebird/', 'href="/firebird/'],
};

try {
  const results = await replace(options);
  console.log('Replacement results:', results);
} catch (error) {
  console.error('Error occurred:', error);
}
