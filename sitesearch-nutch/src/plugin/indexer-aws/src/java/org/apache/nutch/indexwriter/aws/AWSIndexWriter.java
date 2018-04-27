/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.nutch.indexwriter.aws;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.http.HttpEntity;
import org.apache.http.util.EntityUtils;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.entity.ContentType;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.nio.entity.NStringEntity;
import org.apache.nutch.indexer.IndexWriter;
import org.apache.nutch.indexer.NutchDocument;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.elasticsearch.ElasticsearchException;
import java.net.URLEncoder;

import com.amazonaws.auth.AWS4Signer;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.auth.InstanceProfileCredentialsProvider;

/**
 */
public class AWSIndexWriter implements IndexWriter {
	public static Logger LOG = LoggerFactory.getLogger(AWSIndexWriter.class);

	public final String AWS_ENDPOINT = "aws.endpoint";
	public final String AWS_SERVICE = "es";
	public final String AWS_REGION = "us-east-1";
	public final String AWS_PROFILE = "aws.profile";
	public final String AWS_INDEX = "aws.index";
	public final String CRAWLID = "storage.crawl.id";

	private String awsProfile;
	private String awsEndpoint;
	private String awsIndex;
	private RestClient client;

	private Configuration config;

	private void sendRequest(String method, String type,String id, Map<String,String> source) throws IOException {

      String json = new JSONObject(source).toString();

      HttpEntity entity = new NStringEntity(json, ContentType.APPLICATION_JSON);

			LOG.info("AWS Indexer : sending request : "+ this.awsIndex + "/" + type + "/" + URLEncoder.encode(id,"UTF-8"));

			if(method.equalsIgnoreCase("put")){
				Response response = this.client.performRequest("PUT", "/" + this.awsIndex + "/" + type + "/" + URLEncoder.encode(id,"UTF-8"),
			  	Collections.<String, String>emptyMap(), entity);
				LOG.info("AWS Indexer PUT : response : "+ response.toString());
			}
			else if(method.equalsIgnoreCase("delete")){
				Response response = this.client.performRequest("DELETE", "/" + this.awsIndex + "/" + type + "/" + URLEncoder.encode(id,"UTF-8"));
				LOG.info("AWS Indexer DELETE : response : "+ response.toString());
			}

			EntityUtils.consume(entity);


  }

	@Override
	public void open(Configuration conf) throws IOException {

	}

	@Override
	public void write(NutchDocument doc) throws IOException {
		String id = (String) doc.getFieldValue("id");
		String type = doc.getDocumentMeta().get("type");
		if (type == null)
			type = "doc";

		Map<String, String> source = new HashMap<String, String>();

		// Loop through all fields of this doc
		for (String fieldName : doc.getFieldNames()) {
			if (doc.getFieldValues(fieldName).size() > 1) {
				source.put(fieldName, doc.getFieldValue(fieldName).toString());
			} else {
				source.put(fieldName, doc.getFieldValue(fieldName).toString());
			}
		}
		LOG.info("AWS Indexer : "+type+" : "+id);

		this.sendRequest("PUT",type, id, source);
	}

	@Override
	public void delete(String key) throws IOException {
		Map<String, String> source = new HashMap<String, String>();
		this.sendRequest("DELETE","doc", key,source);
	}

	@Override
	public void update(NutchDocument doc) throws IOException {
		write(doc);
	}

	@Override
	public void commit() throws IOException {

	}

	@Override
	public void close() throws IOException {
		try{
			LOG.info("AWS Indexer : closing client");
			this.client.close();
			LOG.info("AWS Indexer : closed client");
		}catch(Exception e){
			LOG.info("AWS Indexer : exception while closing client");
		}
	}

	@Override
	public String describe() {
		StringBuffer sb = new StringBuffer("AWSIndexWriter\n");
		sb.append("\t").append(this.awsEndpoint).append(" : aws endpoint\n");
		sb.append("\t").append(this.awsProfile).append(" : profile\n");
		sb.append("\t").append(this.awsIndex).append(" : index  (default nutch)\n");

		return sb.toString();
	}

	@Override
	public void setConf(Configuration conf) {
		config = conf;
		this.awsEndpoint = conf.get(AWS_ENDPOINT);
		this.awsProfile = conf.get(AWS_PROFILE, "default");
		this.awsIndex = conf.get(AWS_INDEX, "nutch");

		String crawlId = conf.get(CRAWLID);
		LOG.info("AWS IndexWriter crawlId : "+crawlId);
		this.awsIndex = crawlId.split("-")[0];
		LOG.info("AWS IndexWriter index : "+this.awsIndex);


		if (StringUtils.isBlank(awsEndpoint)) {
			String message = "Missing aws.endpoint. At least one of them should be set in nutch-site.xml ";
			message += "\n" + describe();
			LOG.error(message);
			throw new RuntimeException(message);
		}

		AWS4Signer signer = new AWS4Signer();
		signer.setServiceName(this.AWS_SERVICE);
		signer.setRegionName(this.AWS_REGION);

		AWSCredentialsProvider credentialsProvider = InstanceProfileCredentialsProvider.getInstance();
		final HttpRequestInterceptor interceptor = new AWSRequestSigningApacheInterceptor(this.AWS_SERVICE, signer, credentialsProvider);

		this.client = RestClient.builder(new HttpHost(this.awsEndpoint, 443, "https"))
				.setHttpClientConfigCallback(new RestClientBuilder.HttpClientConfigCallback() {

			@Override
			public HttpAsyncClientBuilder customizeHttpClient(HttpAsyncClientBuilder hacb) {
				hacb.addInterceptorLast(interceptor);
				return hacb;
			}}).build();
	}

	@Override
	public Configuration getConf() {
		return config;
	}
}
