cat<<EOF
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<!-- Put site-specific property overrides in this file. -->

<configuration>

<property>
 <name>http.agent.name</name>
 <value>Mozilla/5.0 (compatible; Googlebot/2.1;+http://www.google.com/bot.html) </value>
</property>
<property>
  <name>plugin.includes</name>
 <value>protocol-http|language-identifier|urlfilter-regex|parse-(html|tika|metatags)|index-(basic|anchor|metadata)|urlnormalizer-(pass|regex|basic)|scoring-opic|indexer-aws</value>
</property>
<property>
  <name>storage.data.store.class</name>
  <value>org.apache.gora.mongodb.store.MongoStore</value>
</property>
<property>
  <name>index.metadata</name>
  <value>description,keywords,og:url,og:image,og:site_name,og:type,og:title,og:description;og:locale</value>
  <description>
  Comma-separated list of keys to be taken from the metadata to generate fields.
  Can be used e.g. for 'description' or 'keywords' provided that these values are generated
  by a parser (see parse-metatags plugin), and property 'metatags.names'.
  </description>
</property>
<property>
  <name>plugin.folders</name>
  <value>${PLUGIN_FOLDERS}</value>
</property>
</configuration>
EOF
