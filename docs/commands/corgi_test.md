# corgi test

## corgi test

Runs test on each service, if it specified

```
corgi test [flags]
```

### Options

```
      --env strings        Slice of test names to choose from.
                           
                           If you provide at least 1 env here, than corgi will choose only to run these test names, while ignoring all others.
                           (--env local,dev,prod)
                           
                           By default all tests are included to run.
                           		
  -h, --help               help for test
      --services strings   Slice of services to choose from.
                           
                           If you provide at least 1 services here, than corgi will choose only this service, while ignoring all others.
                           none - will ignore all services run test.
                           (--services app,server)
                           
                           By default all services are included and test are run on them.
                           		
```

### Options inherited from parent commands

```
      --describe                  Describe contents of corgi-compose file
      --dockerContext string      Specify docker context to use, can be default,orbctl,colima (default "default")
  -l, --exampleList               List examples to choose from. Click on any example to download it
  -f, --filename string           Custom filepath for for corgi-compose
      --fromScratch               Clean corgi_services folder before running
  -t, --fromTemplate string       Create corgi service from template url
  -n, --fromTemplateName string   Create corgi service from template name and url
  -g, --global                    Use global path to one of the services
      --privateToken string       Private token for private repositories to download files
      --runOnce                   Run corgi once and exit
      --silent                    Hide all welcome messages
```

### SEE ALSO

* [corgi](corgi)	 - Corgi cli magic friend

###### Auto generated by spf13/cobra on 4-Jun-2024
