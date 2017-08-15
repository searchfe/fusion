default:
	rm -rf ./dist/*
	fis3 release --dest=./dist --root=./src/
	npm run test-reports
